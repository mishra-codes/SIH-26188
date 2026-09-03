from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def _normalize(value: float, minimum: float, maximum: float) -> float:
    """Normalize a value into the 0-1 range."""
    if maximum == minimum:
        return 0.0

    return float(np.clip((value - minimum) / (maximum - minimum), 0.0, 1.0))


def _calculate_entropy(gray: np.ndarray) -> float:
    """Calculate grayscale image entropy."""
    histogram = np.bincount(gray.flatten(), minlength=256).astype(np.float64)

    probabilities = histogram / histogram.sum()
    probabilities = probabilities[probabilities > 0]

    return float(-np.sum(probabilities * np.log2(probabilities)))


def _calculate_edge_density(gray: np.ndarray) -> float:
    """Estimate edge density using simple image gradients."""
    image = gray.astype(np.float32)

    horizontal = np.abs(np.diff(image, axis=1))
    vertical = np.abs(np.diff(image, axis=0))

    horizontal_edges = horizontal > 20
    vertical_edges = vertical > 20

    horizontal_density = horizontal_edges.mean()
    vertical_density = vertical_edges.mean()

    return float((horizontal_density + vertical_density) / 2.0)


def _calculate_noise_std(image: Image.Image) -> float:
    """
    Estimate high-frequency noise.

    The original image is compared against a lightly blurred version.
    Local edits can introduce different high-frequency characteristics.
    """
    gray = image.convert("L")

    blurred = gray.filter(ImageFilter.GaussianBlur(radius=1.0))

    original_array = np.asarray(gray, dtype=np.float32)
    blurred_array = np.asarray(blurred, dtype=np.float32)

    residual = original_array - blurred_array

    return float(np.std(residual))


def _calculate_local_variation(gray: np.ndarray) -> float:
    """Estimate local pixel variation across the image."""
    image = gray.astype(np.float32)

    horizontal_diff = np.abs(np.diff(image, axis=1))
    vertical_diff = np.abs(np.diff(image, axis=0))

    return float(
        (
            horizontal_diff.mean()
            + vertical_diff.mean()
        )
        / 2.0
    )


def extract_forensic_features(image_path: str | Path) -> dict[str, float]:
    """
    Extract basic image-forensic features.

    These features are not a final fake-document detector.
    They provide measurable evidence for the first ML baseline.
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
        gray = np.asarray(gray_image, dtype=np.uint8)

        brightness_mean = float(np.mean(gray))
        brightness_std = float(np.std(gray))

        entropy = _calculate_entropy(gray)
        edge_density = _calculate_edge_density(gray)
        noise_std = _calculate_noise_std(image)
        local_variation = _calculate_local_variation(gray)

        aspect_ratio = width / height if height else 0.0

        return {
            "width": float(width),
            "height": float(height),
            "aspect_ratio": float(aspect_ratio),
            "brightness_mean": brightness_mean,
            "brightness_std": brightness_std,
            "entropy": entropy,
            "edge_density": edge_density,
            "noise_std": noise_std,
            "local_variation": local_variation,
        }