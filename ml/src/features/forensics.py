from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


GRID_ROWS = 4
GRID_COLS = 4


def _calculate_entropy(gray: np.ndarray) -> float:
    """Calculate grayscale image entropy."""
    histogram = np.bincount(
        gray.flatten(),
        minlength=256,
    ).astype(np.float64)

    probabilities = histogram / histogram.sum()
    probabilities = probabilities[probabilities > 0]

    return float(
        -np.sum(
            probabilities * np.log2(probabilities)
        )
    )


def _calculate_edge_density(gray: np.ndarray) -> float:
    """Estimate edge density using simple image gradients."""
    image = gray.astype(np.float32)

    horizontal = np.abs(np.diff(image, axis=1))
    vertical = np.abs(np.diff(image, axis=0))

    horizontal_edges = horizontal > 20
    vertical_edges = vertical > 20

    horizontal_density = horizontal_edges.mean()
    vertical_density = vertical_edges.mean()

    return float(
        (horizontal_density + vertical_density) / 2.0
    )


def _calculate_noise_std(image: Image.Image) -> float:
    """
    Estimate high-frequency noise.

    The original image is compared against a lightly
    blurred version.
    """
    gray = image.convert("L")

    blurred = gray.filter(
        ImageFilter.GaussianBlur(radius=1.0)
    )

    original_array = np.asarray(
        gray,
        dtype=np.float32,
    )

    blurred_array = np.asarray(
        blurred,
        dtype=np.float32,
    )

    residual = original_array - blurred_array

    return float(np.std(residual))


def _calculate_local_variation(gray: np.ndarray) -> float:
    """Estimate local pixel variation."""
    image = gray.astype(np.float32)

    horizontal_diff = np.abs(
        np.diff(image, axis=1)
    )

    vertical_diff = np.abs(
        np.diff(image, axis=0)
    )

    return float(
        (
            horizontal_diff.mean()
            + vertical_diff.mean()
        )
        / 2.0
    )


def _extract_region_features(
    gray: np.ndarray,
    x_start: int,
    x_end: int,
    y_start: int,
    y_end: int,
) -> dict[str, float]:
    """Extract forensic features from one image region."""
    region = gray[
        y_start:y_end,
        x_start:x_end,
    ]

    if region.size == 0:
        return {
            "brightness_mean": 0.0,
            "brightness_std": 0.0,
            "entropy": 0.0,
            "edge_density": 0.0,
            "noise_std": 0.0,
            "local_variation": 0.0,
        }

    region_image = Image.fromarray(region)

    return {
        "brightness_mean": float(np.mean(region)),
        "brightness_std": float(np.std(region)),
        "entropy": _calculate_entropy(region),
        "edge_density": _calculate_edge_density(region),
        "noise_std": _calculate_noise_std(region_image),
        "local_variation": _calculate_local_variation(region),
    }


def _extract_grid_features(
    gray: np.ndarray,
) -> dict[str, float]:
    """
    Extract forensic features from a 4x4 image grid.

    This avoids hard-coding passport field coordinates.
    """
    height, width = gray.shape

    features = {}

    region_number = 1

    for row in range(GRID_ROWS):
        y_start = row * height // GRID_ROWS
        y_end = (row + 1) * height // GRID_ROWS

        for column in range(GRID_COLS):
            x_start = column * width // GRID_COLS
            x_end = (column + 1) * width // GRID_COLS

            region_features = _extract_region_features(
                gray,
                x_start,
                x_end,
                y_start,
                y_end,
            )

            for name, value in region_features.items():
                features[
                    f"region_{region_number}_{name}"
                ] = value

            region_number += 1

    return features


def extract_forensic_features(
    image_path: str | Path,
) -> dict[str, float]:
    """
    Extract global and local image-forensic features.

    These features provide evidence for an ML baseline;
    they are not a standalone fake-document detector.
    """
    image_path = Path(image_path)

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    with Image.open(image_path) as image:
        image = image.convert("RGB")

        width, height = image.size

        gray_image = image.convert("L")
        gray = np.asarray(
            gray_image,
            dtype=np.uint8,
        )

        features = {
            "width": float(width),
            "height": float(height),
            "aspect_ratio": (
                width / height
                if height
                else 0.0
            ),
            "brightness_mean": float(
                np.mean(gray)
            ),
            "brightness_std": float(
                np.std(gray)
            ),
            "entropy": _calculate_entropy(gray),
            "edge_density": _calculate_edge_density(gray),
            "noise_std": _calculate_noise_std(image),
            "local_variation": _calculate_local_variation(gray),
        }

        features.update(
            _extract_grid_features(gray)
        )

        return features