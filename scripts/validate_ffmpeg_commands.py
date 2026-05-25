#!/usr/bin/env python3
"""
Validate the FFmpeg command combinations exposed by the app.

The script reads data/codecs.json and data/audio-configurations.json, builds the
same conservative command families as src/utils/ffmpegCommand.ts, runs each
supported combination against a standard input file, probes the rendered output,
and writes Markdown/JSON reports.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass, field
from fractions import Fraction
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = ROOT / "samples" / "HD_INPUT.mp4"
DEFAULT_OUTPUT_DIR = ROOT / ".ffmpeg-validation"

RESOLUTIONS: dict[str, tuple[int, int]] = {
    "NTSC_DV": (720, 480),
    "NTSC_D1": (720, 486),
    "PAL": (720, 576),
    "720p": (1280, 720),
    "1080i": (1920, 1080),
    "1080p": (1920, 1080),
    "1440x1080": (1440, 1080),
    "2K": (2048, 1080),
    "2.8K": (2880, 1620),
    "3.2K": (3200, 1800),
    "4K": (4096, 2160),
    "4.5K": (4448, 3096),
    "6K": (6144, 3240),
    "6.5K": (6560, 3100),
    "8K": (8192, 4320),
    "UHD": (3840, 2160),
    "8K UHD": (7680, 4320),
}

FRAME_RATES: dict[str, float] = {
    "23.98": 23.976,
    "24": 24.0,
    "25": 25.0,
    "29.97": 29.97,
    "30": 30.0,
    "50": 50.0,
    "59.94": 59.94,
    "60": 60.0,
    "120": 120.0,
    "240": 240.0,
}

UNSUPPORTED_RAW_CODECS: dict[str, str] = {
    "arri_raw": "ARRIRAW/ARRICORE are proprietary camera recording formats that FFmpeg cannot author exactly.",
    "braw": "Blackmagic RAW is proprietary and FFmpeg does not provide a BRAW encoder.",
    "canon_raw": "Canon Cinema RAW Light is proprietary and FFmpeg does not provide an exact encoder.",
    "prores_raw": "ProRes RAW encoding is not available in FFmpeg.",
    "red_r3d": "RED R3D is proprietary and FFmpeg does not provide an exact encoder.",
}

H264_PROFILES = {
    "Baseline Profile": "baseline",
    "Main Profile": "main",
    "High Profile": "high",
}

HEVC_PROFILES = {
    "Main Profile": ("main", "yuv420p"),
    "Main 10": ("main10", "yuv420p10le"),
    "Main 4:2:2 10": ("main422-10", "yuv422p10le"),
}

AV1_PROFILES = {
    "Main Profile": ("0", "yuv420p"),
    "High Profile": ("1", "yuv444p10le"),
    "Professional Profile": ("2", "yuv422p10le"),
}

VP9_PROFILES = {
    "Profile 0": ("0", "yuv420p"),
    "Profile 2": ("2", "yuv420p10le"),
}

PRORES_PROFILES = {
    "ProRes 422 Proxy": ("proxy", "yuv422p10le", "Proxy"),
    "ProRes 422 LT": ("lt", "yuv422p10le", "LT"),
    "ProRes 422": ("standard", "yuv422p10le", "Standard"),
    "ProRes 422 HQ": ("hq", "yuv422p10le", "HQ"),
    "ProRes 4444": ("4444", "yuva444p10le", "4444"),
    "ProRes 4444 XQ": ("4444xq", "yuva444p10le", "XQ"),
}

DNXHR_PROFILES = {
    "DNxHR LB": ("dnxhr_lb", "yuv422p", "DNXHR LB"),
    "DNxHR SQ": ("dnxhr_sq", "yuv422p", "DNXHR SQ"),
    "DNxHR HQ": ("dnxhr_hq", "yuv422p", "DNXHR HQ"),
    "DNxHR HQX": ("dnxhr_hqx", "yuv422p10le", "DNXHR HQX"),
    "DNxHR 444": ("dnxhr_444", "yuv444p10le", "DNXHR 444"),
}

DNXHD_TEN_BIT_VARIANTS = {"DNxHD 185x", "DNxHD 220x"}

PIX_FMT_EQUIVALENTS: dict[str, set[str]] = {
    "yuv420p": {"yuv420p", "yuvj420p"},
    "yuv422p": {"yuv422p", "yuvj422p"},
    "yuv444p": {"yuv444p", "yuvj444p"},
}


@dataclass
class VideoRecipe:
    options: list[str]
    muxer: str
    extension: str
    container_label: str
    video_codec: str
    pix_fmt: str | None
    profile_contains: str | None = None
    extra_filter_steps: list[str] = field(default_factory=list)
    allow_audio: bool = True
    mov_faststart: bool = False
    requirements: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)


@dataclass
class AudioRecipe:
    options: list[str]
    audio_codec: str
    sample_rate: int
    channels: int


@dataclass
class CommandCase:
    case_id: str
    category_id: str
    category_name: str
    codec_id: str
    codec_name: str
    variant_name: str
    resolution_id: str
    width: int
    height: int
    frame_rate_id: str
    frame_rate_value: float
    video_bitrate_mbps: float
    audio_profile_id: str | None
    audio_profile_name: str | None
    audio_configuration_id: str | None
    audio_configuration_label: str | None
    video_recipe: VideoRecipe
    audio_recipe: AudioRecipe | None


@dataclass
class UnsupportedCase:
    case_id: str
    category_id: str
    codec_id: str
    codec_name: str
    variant_name: str
    resolution_id: str
    frame_rate_id: str
    audio_profile_id: str | None
    audio_configuration_id: str | None
    reason: str


@dataclass
class ValidationResult:
    case: CommandCase
    status: str
    stage: str
    command: list[str]
    output_path: Path
    elapsed_seconds: float
    details: list[str] = field(default_factory=list)
    stderr_tail: str = ""


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def attach_audio_profiles(codec: dict[str, Any], audio_catalog: dict[str, Any]) -> dict[str, Any]:
    codec = dict(codec)
    codec_profiles = audio_catalog.get("codecProfiles", {}).get(codec["id"])
    if codec_profiles:
        codec["audioProfiles"] = codec_profiles.get("audioProfiles", [])
        codec["defaultAudioProfileId"] = codec_profiles.get("defaultAudioProfileId")

    variants = []
    for variant in codec.get("variants", []):
        next_variant = dict(variant)
        key = f"{codec['id']}::{variant['name']}"
        variant_profiles = audio_catalog.get("variantProfiles", {}).get(key)
        if variant_profiles:
            next_variant["audioProfiles"] = variant_profiles.get("audioProfiles", [])
            next_variant["defaultAudioProfileId"] = variant_profiles.get("defaultAudioProfileId")
        variants.append(next_variant)

    codec["variants"] = variants
    return codec


def load_categories() -> list[dict[str, Any]]:
    codec_catalog = load_json(ROOT / "data" / "codecs.json")
    audio_catalog = load_json(ROOT / "data" / "audio-configurations.json")
    categories = []

    for category in codec_catalog.get("categories", []):
        next_category = dict(category)
        next_category["codecs"] = [
            attach_audio_profiles(codec, audio_catalog)
            for codec in category.get("codecs", [])
        ]
        categories.append(next_category)

    return categories


def audio_profiles(codec: dict[str, Any], variant: dict[str, Any]) -> list[dict[str, Any]]:
    return variant.get("audioProfiles") or codec.get("audioProfiles") or []


def iter_bitrates(variant: dict[str, Any]) -> list[tuple[str, str, float]]:
    pairs: list[tuple[str, str, float]] = []
    for resolution_id, bitrate_data in variant.get("bitrates", {}).items():
        if resolution_id not in RESOLUTIONS:
            continue
        if isinstance(bitrate_data, (int, float)):
            pairs.append((resolution_id, "30", float(bitrate_data)))
        elif isinstance(bitrate_data, dict):
            for frame_rate_id, bitrate in bitrate_data.items():
                if frame_rate_id in FRAME_RATES:
                    pairs.append((resolution_id, frame_rate_id, float(bitrate)))
    return pairs


def bitrate_kbps(mbps: float) -> int:
    return round(mbps * 1000)


def bitrate_arg(mbps: float) -> str:
    return f"{bitrate_kbps(mbps)}k"


def doubled_bitrate_arg(mbps: float) -> str:
    return f"{bitrate_kbps(mbps) * 2}k"


def frame_rate_arg(frame_rate_id: str, frame_rate_value: float) -> str:
    if frame_rate_id == "23.98":
        return "24000/1001"
    if frame_rate_id == "29.97":
        return "30000/1001"
    if frame_rate_id == "59.94":
        return "60000/1001"
    if float(frame_rate_value).is_integer():
        return str(int(frame_rate_value))
    return frame_rate_id


def gop_size(frame_rate_value: float) -> int:
    return max(1, round(frame_rate_value * 2))


def h264_level(width: int, height: int, frame_rate_value: float) -> str:
    macroblocks_per_frame = math.ceil(width / 16) * math.ceil(height / 16)
    macroblocks_per_second = macroblocks_per_frame * frame_rate_value
    levels = [
        ("3.0", 40500, 1620),
        ("3.1", 108000, 3600),
        ("3.2", 216000, 5120),
        ("4.0", 245760, 8192),
        ("4.2", 522240, 8704),
        ("5.1", 983040, 36864),
        ("5.2", 2073600, 36864),
        ("6.1", 8355840, 139264),
    ]
    for level, max_mb_per_second, max_frame_size in levels:
        if macroblocks_per_frame <= max_frame_size and macroblocks_per_second <= max_mb_per_second:
            return level
    return "6.2"


def unsupported(reason: str) -> str:
    return reason


def build_h264_recipe(variant_name: str, width: int, height: int, frame_rate_value: float, video_bitrate: float) -> VideoRecipe | str:
    profile = H264_PROFILES.get(variant_name)
    if not profile:
        return unsupported(f"No H.264 recipe for {variant_name}.")
    keyint = str(gop_size(frame_rate_value))
    options = [
        "-c:v", "libx264",
        "-profile:v", profile,
        "-level:v", h264_level(width, height, frame_rate_value),
        "-preset", "slow",
        "-b:v", bitrate_arg(video_bitrate),
        "-maxrate:v", bitrate_arg(video_bitrate),
        "-bufsize:v", doubled_bitrate_arg(video_bitrate),
        "-g", keyint,
        "-keyint_min", keyint,
        "-sc_threshold", "0",
        "-x264-params", "nal-hrd=vbr",
    ]
    if profile == "baseline":
        options.extend(["-bf:v", "0", "-coder:v", "vlc"])
    return VideoRecipe(
        options=options,
        muxer="mp4",
        extension="mp4",
        container_label="MP4",
        video_codec="h264",
        pix_fmt="yuv420p",
        profile_contains=profile.capitalize(),
        mov_faststart=True,
        requirements=["FFmpeg built with libx264"],
    )


def build_hevc_recipe(variant_name: str, frame_rate_value: float, video_bitrate: float) -> VideoRecipe | str:
    profile = HEVC_PROFILES.get(variant_name)
    if not profile:
        return unsupported(f"No HEVC recipe for {variant_name}.")
    profile_name, pix_fmt = profile
    keyint = gop_size(frame_rate_value)
    maxrate = bitrate_kbps(video_bitrate)
    bufsize = maxrate * 2
    return VideoRecipe(
        options=[
            "-c:v", "libx265",
            "-profile:v", profile_name,
            "-preset", "medium",
            "-b:v", bitrate_arg(video_bitrate),
            "-tag:v", "hvc1",
            "-x265-params", f"vbv-maxrate={maxrate}:vbv-bufsize={bufsize}:keyint={keyint}:min-keyint={keyint}:scenecut=0",
        ],
        muxer="mp4",
        extension="mp4",
        container_label="MP4",
        video_codec="hevc",
        pix_fmt=pix_fmt,
        profile_contains="Main" if variant_name == "Main Profile" else None,
        mov_faststart=True,
        requirements=["FFmpeg built with libx265"],
    )


def build_av1_recipe(variant_name: str, frame_rate_value: float, video_bitrate: float, audio_profile_id: str | None) -> VideoRecipe | str:
    profile = AV1_PROFILES.get(variant_name)
    if not profile:
        return unsupported(f"No AV1 recipe for {variant_name}.")
    profile_name, pix_fmt = profile
    if profile_name != "0":
        return unsupported("SVT-AV1 validation supports AV1 Main Profile 4:2:0 output; this variant requires a higher-chroma AV1 profile.")
    uses_mp4_audio = audio_profile_id == "mp4-aac"
    muxer = "mp4" if uses_mp4_audio else "webm"
    return VideoRecipe(
        options=[
            "-c:v", "libsvtav1",
            "-profile:v", profile_name,
            "-preset", "8",
            "-b:v", bitrate_arg(video_bitrate),
            "-g", str(gop_size(frame_rate_value)),
        ],
        muxer=muxer,
        extension=muxer,
        container_label="MP4" if uses_mp4_audio else "WebM",
        video_codec="av1",
        pix_fmt=pix_fmt,
        profile_contains="Main",
        mov_faststart=uses_mp4_audio,
        requirements=["FFmpeg built with libsvtav1"],
    )


def build_vp9_recipe(variant_name: str, frame_rate_value: float, video_bitrate: float) -> VideoRecipe | str:
    profile = VP9_PROFILES.get(variant_name)
    if not profile:
        return unsupported(f"No VP9 recipe for {variant_name}.")
    profile_name, pix_fmt = profile
    return VideoRecipe(
        options=[
            "-c:v", "libvpx-vp9",
            "-profile:v", profile_name,
            "-deadline", "good",
            "-cpu-used", "2",
            "-b:v", bitrate_arg(video_bitrate),
            "-g", str(gop_size(frame_rate_value)),
        ],
        muxer="webm",
        extension="webm",
        container_label="WebM",
        video_codec="vp9",
        pix_fmt=pix_fmt,
        profile_contains=f"Profile {profile_name}",
        requirements=["FFmpeg built with libvpx-vp9"],
    )


def build_prores_recipe(variant_name: str) -> VideoRecipe | str:
    profile = PRORES_PROFILES.get(variant_name)
    if not profile:
        return unsupported(f"No ProRes recipe for {variant_name}.")
    profile_name, pix_fmt, probe_profile = profile
    options = ["-c:v", "prores_ks", "-profile:v", profile_name, "-vendor", "apl0"]
    if pix_fmt == "yuva444p10le":
        options.extend(["-alpha_bits", "16"])
    return VideoRecipe(
        options=options,
        muxer="mov",
        extension="mov",
        container_label="QuickTime MOV",
        video_codec="prores",
        pix_fmt=pix_fmt,
        profile_contains=probe_profile,
    )


def build_dnx_recipe(variant_name: str, video_bitrate: float) -> VideoRecipe | str:
    dnxhr = DNXHR_PROFILES.get(variant_name)
    if dnxhr:
        profile_name, pix_fmt, probe_profile = dnxhr
        return VideoRecipe(
            options=["-c:v", "dnxhd", "-profile:v", profile_name],
            muxer="mov",
            extension="mov",
            container_label="QuickTime MOV",
            video_codec="dnxhd",
            pix_fmt=pix_fmt,
            profile_contains=probe_profile,
        )
    if not variant_name.startswith("DNxHD "):
        return unsupported(f"No DNxHD/DNxHR recipe for {variant_name}.")
    return VideoRecipe(
        options=["-c:v", "dnxhd", "-b:v", bitrate_arg(video_bitrate)],
        muxer="mov",
        extension="mov",
        container_label="QuickTime MOV",
        video_codec="dnxhd",
        pix_fmt="yuv422p10le" if variant_name in DNXHD_TEN_BIT_VARIANTS else "yuv422p",
    )


def build_avc_intra_recipe(variant_name: str, frame_rate_id: str) -> VideoRecipe | str:
    match = re.match(r"^AVC-Intra (\d+)$", variant_name)
    if not match:
        return unsupported(f"No AVC-Intra recipe for {variant_name}.")
    if frame_rate_id in {"30", "60"}:
        return unsupported("AVC-Intra validation skips exact 30/60 fps because libx264 supports the fractional NTSC rates for this mode.")
    avc_intra_class = match.group(1)
    return VideoRecipe(
        options=["-c:v", "libx264", "-avcintra-class", avc_intra_class],
        muxer="mxf",
        extension="mxf",
        container_label="MXF",
        video_codec="h264",
        pix_fmt="yuv420p10le" if avc_intra_class == "50" else "yuv422p10le",
        profile_contains="Intra",
        requirements=["FFmpeg built with libx264"],
    )


def build_mpeg2_recipe(variant_name: str, resolution_id: str, frame_rate_value: float, video_bitrate: float) -> VideoRecipe:
    is_422 = "422P" in variant_name
    is_interlaced = resolution_id == "1080i"
    options = [
        "-c:v", "mpeg2video",
        "-b:v", bitrate_arg(video_bitrate),
        "-minrate:v", bitrate_arg(video_bitrate),
        "-maxrate:v", bitrate_arg(video_bitrate),
        "-bufsize:v", doubled_bitrate_arg(video_bitrate),
        "-g", str(15 if frame_rate_value >= 29 else 12),
    ]
    extra_filter_steps: list[str] = []
    if is_interlaced:
        options.extend(["-flags:v", "+ildct+ilme", "-top", "1"])
        extra_filter_steps.append("setfield=tff")
    return VideoRecipe(
        options=options,
        muxer="mpegts",
        extension="ts",
        container_label="MPEG-TS",
        video_codec="mpeg2video",
        pix_fmt="yuv422p" if is_422 else "yuv420p",
        extra_filter_steps=extra_filter_steps,
    )


def build_mxf_d10_recipe(resolution_id: str, frame_rate_id: str, video_bitrate: float) -> VideoRecipe | str:
    if resolution_id != "PAL" or frame_rate_id != "25":
        return unsupported("MXF D-10 is only validated for PAL 25 fps; NTSC D-10 is known to be fragile in FFmpeg.")
    return VideoRecipe(
        options=[
            "-c:v", "mpeg2video",
            "-pix_fmt", "yuv422p",
            "-b:v", bitrate_arg(video_bitrate),
            "-minrate:v", bitrate_arg(video_bitrate),
            "-maxrate:v", bitrate_arg(video_bitrate),
            "-bufsize:v", "2000000",
            "-rc_init_occupancy:v", "2000000",
            "-flags:v", "+ildct+ilme",
            "-top", "1",
        ],
        muxer="mxf_d10",
        extension="mxf",
        container_label="MXF D-10",
        video_codec="mpeg2video",
        pix_fmt="yuv422p",
        extra_filter_steps=["setfield=tff"],
    )


def build_jpeg2000_recipe(variant_name: str, video_bitrate: float) -> VideoRecipe | str:
    if "IMF" in variant_name:
        return unsupported("Package-level JPEG 2000 delivery profiles such as IMF/DCP are not single FFmpeg-authored media files.")
    options = ["-c:v", "jpeg2000", "-format", "j2k"]
    if "lossless" in variant_name.lower():
        options.extend(["-pred", "1"])
    else:
        options.extend(["-b:v", bitrate_arg(video_bitrate)])
    return VideoRecipe(
        options=options,
        muxer="mxf",
        extension="mxf",
        container_label="MXF",
        video_codec="jpeg2000",
        pix_fmt="yuv422p10le",
    )


def build_video_recipe(
    codec_id: str,
    codec_name: str,
    variant_name: str,
    resolution_id: str,
    width: int,
    height: int,
    frame_rate_id: str,
    frame_rate_value: float,
    video_bitrate: float,
    audio_profile_id: str | None,
) -> VideoRecipe | str:
    if codec_id in UNSUPPORTED_RAW_CODECS:
        return unsupported(UNSUPPORTED_RAW_CODECS[codec_id])
    if codec_id == "h264":
        return build_h264_recipe(variant_name, width, height, frame_rate_value, video_bitrate)
    if codec_id == "h265":
        return build_hevc_recipe(variant_name, frame_rate_value, video_bitrate)
    if codec_id == "av1":
        return build_av1_recipe(variant_name, frame_rate_value, video_bitrate, audio_profile_id)
    if codec_id == "vp9":
        return build_vp9_recipe(variant_name, frame_rate_value, video_bitrate)
    if codec_id == "prores":
        return build_prores_recipe(variant_name)
    if codec_id == "dnxhd":
        return build_dnx_recipe(variant_name, video_bitrate)
    if codec_id == "cineform":
        return unsupported("CineForm recipes are not exact because the catalog does not map variants to CFHD encoder settings.")
    if codec_id == "avc_intra":
        return build_avc_intra_recipe(variant_name, frame_rate_id)
    if codec_id == "xavc":
        return unsupported("Sony XAVC needs Sony-specific operating-point metadata not yet represented in the catalog.")
    if codec_id == "xdcam":
        return unsupported("Sony XDCAM needs Sony-specific wrapper metadata not yet represented in the catalog.")
    if codec_id == "jpeg2000":
        return build_jpeg2000_recipe(variant_name, video_bitrate)
    if codec_id == "mpeg2":
        return build_mpeg2_recipe(variant_name, resolution_id, frame_rate_value, video_bitrate)
    if codec_id == "mxf_d10":
        return build_mxf_d10_recipe(resolution_id, frame_rate_id, video_bitrate)
    if codec_id == "lossless_jpeg2000":
        return VideoRecipe(["-c:v", "jpeg2000", "-pred", "1"], "mxf", "mxf", "MXF", "jpeg2000", "yuv422p10le")
    if codec_id == "ffv1":
        return VideoRecipe(["-c:v", "ffv1", "-level", "3", "-coder", "1", "-context", "1", "-g", "1", "-slicecrc", "1"], "matroska", "mkv", "Matroska", "ffv1", "yuv422p10le")
    if codec_id == "uncompressed":
        if "4:2:2" not in variant_name:
            return unsupported(f"No uncompressed video recipe for {variant_name}.")
        pix_fmt = "yuv422p10le" if "10-bit" in variant_name else "yuv422p"
        return VideoRecipe(["-c:v", "rawvideo"], "mov", "mov", "QuickTime MOV", "rawvideo", pix_fmt)
    return unsupported(f"FFmpeg command generation has not been researched for {codec_name}.")


def build_audio_recipe(profile: dict[str, Any], configuration: dict[str, Any]) -> AudioRecipe | str:
    sample_rate = int(configuration.get("sampleRateHz") or profile.get("sampleRateHz") or 48000)
    channels = int(configuration["channels"])

    if profile["kind"] == "compressed":
        bitrate = configuration.get("bitrateKbps") or profile.get("bitrateKbps")
        if not bitrate:
            return unsupported(f"Audio profile {profile['name']} is missing bitrateKbps.")
        if profile["id"] in {"mp4-aac", "xavc-mp4-aac"}:
            return AudioRecipe(["-c:a", "aac", "-profile:a", "aac_low", "-b:a", f"{bitrate}k", "-ar", str(sample_rate), "-ac", str(channels)], "aac", sample_rate, channels)
        if profile["id"] == "webm-opus":
            return AudioRecipe(["-c:a", "libopus", "-b:a", f"{bitrate}k", "-vbr", "constrained", "-ar", str(sample_rate), "-ac", str(channels)], "opus", sample_rate, channels)
        if profile["id"] == "hls-surround":
            encoder = "eac3" if configuration["id"].startswith("eac3") else "ac3"
            return AudioRecipe(["-c:a", encoder, "-b:a", f"{bitrate}k", "-ar", str(sample_rate), "-ac", str(channels)], encoder, sample_rate, channels)
        if profile["id"] == "broadcast-aac-layer-ac3":
            if configuration["id"].startswith("layer2"):
                encoder = "mp2"
                return AudioRecipe(["-c:a", encoder, "-b:a", f"{bitrate}k", "-ar", str(sample_rate), "-ac", str(channels)], encoder, sample_rate, channels)
            if configuration["id"].startswith("ac3"):
                encoder = "ac3"
                return AudioRecipe(["-c:a", encoder, "-b:a", f"{bitrate}k", "-ar", str(sample_rate), "-ac", str(channels)], encoder, sample_rate, channels)
            return AudioRecipe(["-c:a", "aac", "-profile:a", "aac_low", "-b:a", f"{bitrate}k", "-ar", str(sample_rate), "-ac", str(channels)], "aac", sample_rate, channels)
        return unsupported(f"No audio recipe for {profile['name']}.")

    if profile["kind"] == "pcm":
        bit_depth = int(configuration.get("bitDepth") or profile.get("bitDepth") or 0)
        if bit_depth not in {16, 24, 32}:
            return unsupported(f"Unsupported PCM bit depth: {bit_depth or 'unknown'}.")
        encoder = "pcm_s16le" if bit_depth == 16 else "pcm_s24le" if bit_depth == 24 else "pcm_s32le"
        return AudioRecipe(["-c:a", encoder, "-ar", str(sample_rate), "-ac", str(channels)], encoder, sample_rate, channels)

    return unsupported(f"Unknown audio profile kind: {profile['kind']}.")


def validate_audio_container(video_recipe: VideoRecipe, audio_profile_id: str) -> str | None:
    if not video_recipe.allow_audio:
        return f"{video_recipe.container_label} output cannot carry selected audio in one file."
    if video_recipe.muxer == "webm" and audio_profile_id != "webm-opus":
        return "WebM output requires Opus audio."
    if video_recipe.muxer == "mp4" and audio_profile_id not in {"mp4-aac", "xavc-mp4-aac", "hls-surround"}:
        return "MP4 output cannot carry selected audio profile."
    if video_recipe.muxer == "mpegts" and audio_profile_id != "broadcast-aac-layer-ac3":
        return "MPEG-TS output requires transport-compatible audio."
    return None


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return slug[:120] or "case"


def audio_variants(codec: dict[str, Any], variant: dict[str, Any], audio_mode: str) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    profiles = audio_profiles(codec, variant)
    if audio_mode == "none" or not profiles:
        return []
    if audio_mode == "default":
        default_profile_id = variant.get("defaultAudioProfileId") or codec.get("defaultAudioProfileId") or profiles[0]["id"]
        profile = next((item for item in profiles if item["id"] == default_profile_id), profiles[0])
        default_config_id = profile.get("defaultConfigurationId") or profile["configurations"][0]["id"]
        configuration = next((item for item in profile["configurations"] if item["id"] == default_config_id), profile["configurations"][0])
        return [(profile, configuration)]

    pairs = []
    for profile in profiles:
        for configuration in profile.get("configurations", []):
            pairs.append((profile, configuration))
    return pairs


def enumerate_cases(audio_mode: str, include_video_only: bool) -> tuple[list[CommandCase], list[UnsupportedCase]]:
    categories = load_categories()
    cases: list[CommandCase] = []
    unsupported_cases: list[UnsupportedCase] = []
    seen_ids: dict[str, int] = {}

    for category in categories:
        for codec in category.get("codecs", []):
            for variant in codec.get("variants", []):
                for resolution_id, frame_rate_id, bitrate in iter_bitrates(variant):
                    width, height = RESOLUTIONS[resolution_id]
                    frame_rate_value = FRAME_RATES[frame_rate_id]
                    audio_options: list[tuple[dict[str, Any] | None, dict[str, Any] | None]] = []
                    if include_video_only:
                        audio_options.append((None, None))
                    audio_options.extend(audio_variants(codec, variant, audio_mode))

                    for profile, configuration in audio_options:
                        audio_profile_id = profile["id"] if profile else None
                        audio_configuration_id = configuration["id"] if configuration else None
                        raw_id = ".".join([
                            category["id"],
                            codec["id"],
                            variant["name"],
                            resolution_id,
                            frame_rate_id,
                            audio_profile_id or "no-audio",
                            audio_configuration_id or "none",
                        ])
                        base_id = slugify(raw_id)
                        seen_ids[base_id] = seen_ids.get(base_id, 0) + 1
                        case_id = base_id if seen_ids[base_id] == 1 else f"{base_id}-{seen_ids[base_id]}"
                        video_recipe = build_video_recipe(
                            codec["id"], codec["name"], variant["name"],
                            resolution_id, width, height, frame_rate_id,
                            frame_rate_value, bitrate, audio_profile_id,
                        )
                        if isinstance(video_recipe, str):
                            unsupported_cases.append(UnsupportedCase(case_id, category["id"], codec["id"], codec["name"], variant["name"], resolution_id, frame_rate_id, audio_profile_id, audio_configuration_id, video_recipe))
                            continue

                        audio_recipe = None
                        if profile and configuration:
                            audio_recipe_result = build_audio_recipe(profile, configuration)
                            if isinstance(audio_recipe_result, str):
                                unsupported_cases.append(UnsupportedCase(case_id, category["id"], codec["id"], codec["name"], variant["name"], resolution_id, frame_rate_id, audio_profile_id, audio_configuration_id, audio_recipe_result))
                                continue
                            container_problem = validate_audio_container(video_recipe, profile["id"])
                            if container_problem:
                                unsupported_cases.append(UnsupportedCase(case_id, category["id"], codec["id"], codec["name"], variant["name"], resolution_id, frame_rate_id, audio_profile_id, audio_configuration_id, container_problem))
                                continue
                            audio_recipe = audio_recipe_result

                        cases.append(CommandCase(
                            case_id=case_id,
                            category_id=category["id"],
                            category_name=category["name"],
                            codec_id=codec["id"],
                            codec_name=codec["name"],
                            variant_name=variant["name"],
                            resolution_id=resolution_id,
                            width=width,
                            height=height,
                            frame_rate_id=frame_rate_id,
                            frame_rate_value=frame_rate_value,
                            video_bitrate_mbps=bitrate,
                            audio_profile_id=audio_profile_id,
                            audio_profile_name=profile["name"] if profile else None,
                            audio_configuration_id=audio_configuration_id,
                            audio_configuration_label=configuration["label"] if configuration else None,
                            video_recipe=video_recipe,
                            audio_recipe=audio_recipe,
                        ))

    return cases, unsupported_cases


def video_filter(case: CommandCase) -> str:
    steps = [
        f"scale={case.width}:{case.height}:flags=lanczos",
        f"fps={frame_rate_arg(case.frame_rate_id, case.frame_rate_value)}",
        *case.video_recipe.extra_filter_steps,
    ]
    if case.video_recipe.pix_fmt:
        steps.append(f"format={case.video_recipe.pix_fmt}")
    return ",".join(steps)


def build_command(case: CommandCase, input_path: Path, output_path: Path, duration: float | None, ffmpeg_log_level: str) -> list[str]:
    command = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        ffmpeg_log_level,
        "-i",
        str(input_path),
        "-map",
        "0:v:0",
        "-vf",
        video_filter(case),
        *case.video_recipe.options,
    ]
    if case.audio_recipe:
        command.extend(["-map", "0:a:0", *case.audio_recipe.options])
    else:
        command.append("-an")
    if case.video_recipe.mov_faststart:
        command.extend(["-movflags", "+faststart"])
    if duration and duration > 0:
        command.extend(["-t", str(duration)])
    command.extend(["-f", case.video_recipe.muxer, str(output_path)])
    return command


def run(command: list[str], timeout: int) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout)


def probe(path: Path) -> dict[str, Any]:
    command = ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)]
    result = run(command, timeout=60)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())
    return json.loads(result.stdout)


def input_has_audio(input_path: Path) -> bool:
    data = probe(input_path)
    return any(stream.get("codec_type") == "audio" for stream in data.get("streams", []))


def make_audio_input(input_path: Path, output_dir: Path, duration: float | None) -> Path:
    output_path = output_dir / "_validation_input_with_audio.mp4"
    if output_path.exists():
        output_path.unlink()
    command = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(input_path),
        "-f", "lavfi",
        "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
    ]
    if duration and duration > 0:
        command.extend(["-t", str(duration)])
    command.append(str(output_path))
    result = run(command, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f"Could not create audio-capable validation input:\n{result.stderr}")
    return output_path


def parse_rate(value: str | None) -> float | None:
    if not value or value == "0/0":
        return None
    try:
        return float(Fraction(value))
    except ZeroDivisionError:
        return None


def close_rate(actual: float | None, expected: float, tolerance: float = 0.03) -> bool:
    return actual is not None and abs(actual - expected) <= tolerance


def format_matches(format_name: str, muxer: str) -> bool:
    allowed = {
        "mp4": {"mp4", "mov"},
        "mov": {"mov", "mp4"},
        "webm": {"webm", "matroska"},
        "matroska": {"matroska", "webm"},
        "mxf": {"mxf"},
        "mxf_d10": {"mxf"},
        "mpegts": {"mpegts"},
    }
    names = set(format_name.split(","))
    return bool(names & allowed.get(muxer, {muxer}))


def validate_probe(case: CommandCase, probe_data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    format_name = probe_data.get("format", {}).get("format_name", "")
    if not format_matches(format_name, case.video_recipe.muxer):
        errors.append(f"container mismatch: expected {case.video_recipe.muxer}, got {format_name or 'unknown'}")

    video_streams = [stream for stream in probe_data.get("streams", []) if stream.get("codec_type") == "video"]
    audio_streams = [stream for stream in probe_data.get("streams", []) if stream.get("codec_type") == "audio"]
    if not video_streams:
        errors.append("missing video stream")
        return errors

    video = video_streams[0]
    if video.get("codec_name") != case.video_recipe.video_codec:
        errors.append(f"video codec mismatch: expected {case.video_recipe.video_codec}, got {video.get('codec_name')}")
    if int(video.get("width", 0)) != case.width or int(video.get("height", 0)) != case.height:
        errors.append(f"resolution mismatch: expected {case.width}x{case.height}, got {video.get('width')}x{video.get('height')}")
    if case.video_recipe.pix_fmt:
        expected_pix_fmts = PIX_FMT_EQUIVALENTS.get(case.video_recipe.pix_fmt, {case.video_recipe.pix_fmt})
        if video.get("pix_fmt") not in expected_pix_fmts:
            errors.append(f"pixel format mismatch: expected {case.video_recipe.pix_fmt}, got {video.get('pix_fmt')}")
    if case.video_recipe.profile_contains:
        profile = str(video.get("profile", ""))
        if case.video_recipe.profile_contains.lower() not in profile.lower():
            errors.append(f"profile mismatch: expected contains {case.video_recipe.profile_contains}, got {profile or 'unknown'}")
    actual_rate = parse_rate(video.get("avg_frame_rate")) or parse_rate(video.get("r_frame_rate"))
    if not close_rate(actual_rate, case.frame_rate_value):
        errors.append(f"frame rate mismatch: expected {case.frame_rate_value}, got {actual_rate if actual_rate is not None else 'unknown'}")

    if case.audio_recipe:
        if not audio_streams:
            errors.append("missing audio stream")
        else:
            audio = audio_streams[0]
            if audio.get("codec_name") != case.audio_recipe.audio_codec:
                errors.append(f"audio codec mismatch: expected {case.audio_recipe.audio_codec}, got {audio.get('codec_name')}")
            if int(audio.get("sample_rate", 0)) != case.audio_recipe.sample_rate:
                errors.append(f"sample-rate mismatch: expected {case.audio_recipe.sample_rate}, got {audio.get('sample_rate')}")
            if int(audio.get("channels", 0)) != case.audio_recipe.channels:
                errors.append(f"channel-count mismatch: expected {case.audio_recipe.channels}, got {audio.get('channels')}")
    elif audio_streams:
        errors.append("unexpected audio stream in video-only output")

    return errors


def tail_text(text: str, lines: int = 12) -> str:
    return "\n".join(text.strip().splitlines()[-lines:])


def validate_case(
    case: CommandCase,
    input_path: Path,
    audio_input_path: Path | None,
    output_dir: Path,
    duration: float | None,
    timeout: int,
    ffmpeg_log_level: str,
    keep_outputs: bool,
) -> ValidationResult:
    source_input = audio_input_path if case.audio_recipe else input_path
    assert source_input is not None
    output_path = output_dir / "outputs" / f"{case.case_id}.{case.video_recipe.extension}"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    command = build_command(case, source_input, output_path, duration, ffmpeg_log_level)
    started = time.monotonic()
    try:
        result = run(command, timeout=timeout)
    except subprocess.TimeoutExpired as error:
        return ValidationResult(case, "failed", "ffmpeg-timeout", command, output_path, time.monotonic() - started, [f"timed out after {timeout}s"], tail_text(error.stderr or ""))

    elapsed = time.monotonic() - started
    if result.returncode != 0:
        return ValidationResult(case, "failed", "ffmpeg-render", command, output_path, elapsed, [f"ffmpeg exited with {result.returncode}"], tail_text(result.stderr))

    try:
        probe_data = probe(output_path)
    except Exception as error:  # noqa: BLE001 - report validation failures without crashing the whole run.
        return ValidationResult(case, "failed", "ffprobe", command, output_path, elapsed, [str(error)], tail_text(result.stderr))

    errors = validate_probe(case, probe_data)
    if errors:
        return ValidationResult(case, "failed", "spec-validation", command, output_path, elapsed, errors, tail_text(result.stderr))

    if not keep_outputs:
        output_path.unlink(missing_ok=True)
    return ValidationResult(case, "passed", "ok", command, output_path, elapsed)


def command_to_shell(command: list[str]) -> str:
    return " ".join(shlex_quote(part) for part in command)


def shlex_quote(value: str) -> str:
    import shlex

    return shlex.quote(value)


def result_to_dict(result: ValidationResult) -> dict[str, Any]:
    case = result.case
    return {
        "id": case.case_id,
        "status": result.status,
        "stage": result.stage,
        "elapsedSeconds": round(result.elapsed_seconds, 3),
        "category": case.category_id,
        "codec": case.codec_id,
        "codecName": case.codec_name,
        "variant": case.variant_name,
        "resolution": case.resolution_id,
        "width": case.width,
        "height": case.height,
        "frameRate": case.frame_rate_id,
        "videoBitrateMbps": case.video_bitrate_mbps,
        "audioProfile": case.audio_profile_id,
        "audioConfiguration": case.audio_configuration_id,
        "muxer": case.video_recipe.muxer,
        "outputExtension": case.video_recipe.extension,
        "command": result.command,
        "outputPath": str(result.output_path),
        "details": result.details,
        "stderrTail": result.stderr_tail,
    }


def unsupported_to_dict(case: UnsupportedCase) -> dict[str, Any]:
    return {
        "id": case.case_id,
        "status": "unsupported",
        "category": case.category_id,
        "codec": case.codec_id,
        "codecName": case.codec_name,
        "variant": case.variant_name,
        "resolution": case.resolution_id,
        "frameRate": case.frame_rate_id,
        "audioProfile": case.audio_profile_id,
        "audioConfiguration": case.audio_configuration_id,
        "reason": case.reason,
    }


def write_reports(output_dir: Path, input_path: Path, results: list[ValidationResult], unsupported_cases: list[UnsupportedCase], duration: float | None, planned_count: int | None = None) -> tuple[Path, Path]:
    report_json = output_dir / "ffmpeg-validation-report.json"
    report_md = output_dir / "ffmpeg-validation-report.md"
    failed = [result for result in results if result.status == "failed"]
    passed = [result for result in results if result.status == "passed"]

    payload = {
        "input": str(input_path),
        "durationSeconds": duration,
        "summary": {
            "passed": len(passed),
            "failed": len(failed),
            "unsupported": len(unsupported_cases),
            "totalRunnable": planned_count if planned_count is not None else len(results),
            "totalRun": len(results),
        },
        "results": [result_to_dict(result) for result in results],
        "unsupported": [unsupported_to_dict(case) for case in unsupported_cases],
    }
    report_json.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    lines = [
        "# FFmpeg Command Validation Report",
        "",
        f"- Input: `{input_path}`",
        f"- Duration limit: `{duration}` seconds" if duration else "- Duration limit: full input",
        f"- Passed: **{len(passed)}**",
        f"- Failed: **{len(failed)}**",
        f"- Runnable command cases: **{planned_count if planned_count is not None else len(results)}**",
        f"- Unsupported/skipped: **{len(unsupported_cases)}**",
        "",
        "Bitrate targets are included in the commands, but this validator checks structural media specs (container, codec, profile where practical, resolution, pixel format, frame rate, audio codec, sample rate, and channel count) rather than exact encoded file bitrate.",
        "",
    ]

    if not results and planned_count:
        lines.extend(["## Failures", "", "Dry run only; no commands were executed.", ""])
    elif failed:
        lines.extend(["## Failures", ""])
        for result in failed:
            case = result.case
            audio_label = f"{case.audio_profile_id}/{case.audio_configuration_id}" if case.audio_profile_id else "no audio"
            lines.extend([
                f"### {case.case_id}",
                "",
                f"- Selection: `{case.codec_id}` / `{case.variant_name}` / `{case.resolution_id}` / `{case.frame_rate_id}` / `{audio_label}`",
                f"- Stage: `{result.stage}`",
                f"- Details: {'; '.join(result.details) if result.details else 'n/a'}",
                "",
                "```bash",
                command_to_shell(result.command),
                "```",
                "",
            ])
            if result.stderr_tail:
                lines.extend(["```text", result.stderr_tail, "```", ""])
    else:
        lines.extend(["## Failures", "", "No runnable command failures.", ""])

    if unsupported_cases:
        lines.extend(["## Unsupported/Skipped", ""])
        for case in unsupported_cases[:200]:
            audio_label = f"{case.audio_profile_id}/{case.audio_configuration_id}" if case.audio_profile_id else "no audio"
            lines.append(f"- `{case.case_id}`: `{case.codec_id}` / `{case.variant_name}` / `{case.resolution_id}` / `{case.frame_rate_id}` / `{audio_label}` - {case.reason}")
        if len(unsupported_cases) > 200:
            lines.append(f"- ... {len(unsupported_cases) - 200} more unsupported cases omitted from Markdown. See JSON report for all entries.")
        lines.append("")

    report_md.write_text("\n".join(lines), encoding="utf-8")
    return report_md, report_json


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate FFmpeg commands generated from the app codec/audio catalog.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT, help=f"Source media file. Default: {DEFAULT_INPUT}")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR, help=f"Report/output directory. Default: {DEFAULT_OUTPUT_DIR}")
    parser.add_argument("--audio-mode", choices=["none", "default", "all"], default="all", help="Audio combinations to validate. Default: all")
    parser.add_argument("--no-video-only", action="store_true", help="Do not include video-only command cases.")
    parser.add_argument("--duration", type=float, default=1.0, help="Limit each render to N seconds for faster validation. Use 0 for full input.")
    parser.add_argument("--timeout", type=int, default=120, help="Per-command timeout in seconds.")
    parser.add_argument("--limit", type=int, default=0, help="Run only the first N runnable cases.")
    parser.add_argument("--match", default="", help="Only run cases whose id contains this substring.")
    parser.add_argument("--dry-run", action="store_true", help="Enumerate and report without running FFmpeg.")
    parser.add_argument("--fail-fast", action="store_true", help="Stop after the first failure.")
    parser.add_argument("--keep-outputs", action="store_true", help="Keep successful rendered outputs. Failed outputs are always left for inspection if present.")
    parser.add_argument("--ffmpeg-log-level", default="error", help="FFmpeg log level for render commands. Default: error")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = args.input.resolve()
    output_dir = args.output_dir.resolve()
    duration = None if args.duration <= 0 else args.duration

    if not input_path.exists():
        print(f"Input file does not exist: {input_path}", file=sys.stderr)
        return 2
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        print("ffmpeg and ffprobe must be available on PATH.", file=sys.stderr)
        return 2

    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "outputs").mkdir(parents=True, exist_ok=True)

    cases, unsupported_cases = enumerate_cases(args.audio_mode, include_video_only=not args.no_video_only)
    if args.match:
        cases = [case for case in cases if args.match.lower() in case.case_id.lower()]
        unsupported_cases = [case for case in unsupported_cases if args.match.lower() in case.case_id.lower()]
    if args.limit > 0:
        cases = cases[:args.limit]

    print(f"Enumerated {len(cases)} runnable command cases and {len(unsupported_cases)} unsupported/skipped cases.")

    results: list[ValidationResult] = []
    if args.dry_run:
        report_md, report_json = write_reports(output_dir, input_path, results, unsupported_cases, duration, planned_count=len(cases))
        print(f"Dry run complete. Reports: {report_md} and {report_json}")
        return 0

    audio_input_path: Path | None = None
    if any(case.audio_recipe for case in cases):
        if input_has_audio(input_path):
            audio_input_path = input_path
        else:
            print("Input has no audio stream; creating temporary silent-audio validation input.")
            audio_input_path = make_audio_input(input_path, output_dir, duration)

    for index, case in enumerate(cases, start=1):
        print(f"[{index}/{len(cases)}] {case.case_id} ... ", end="", flush=True)
        result = validate_case(
            case=case,
            input_path=input_path,
            audio_input_path=audio_input_path,
            output_dir=output_dir,
            duration=duration,
            timeout=args.timeout,
            ffmpeg_log_level=args.ffmpeg_log_level,
            keep_outputs=args.keep_outputs,
        )
        results.append(result)
        print(result.status.upper() if result.status == "passed" else f"FAILED ({result.stage})")
        if result.status == "failed" and args.fail_fast:
            break

    report_md, report_json = write_reports(output_dir, input_path, results, unsupported_cases, duration, planned_count=len(cases))
    passed = sum(1 for result in results if result.status == "passed")
    failed = sum(1 for result in results if result.status == "failed")
    print("")
    print("Summary")
    print("-------")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Unsupported/skipped: {len(unsupported_cases)}")
    print(f"Markdown report: {report_md}")
    print(f"JSON report: {report_json}")

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
