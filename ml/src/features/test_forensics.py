from pathlib import Path

import pytest

from ml.src.features.forensics import extract_forensic_features


GENUINE_IMAGE = Path(
    "data/samples/genuine/doc_0001_genuine.png"
)

TAMPERED_IMAGE = Path(
    "data/samples/tampered/text_modification/"
    "doc_0001_text_modification.png"
)


def test_extract_forensic_features():
    features = extract_forensic_features(GENUINE_IMAGE)

    assert isinstance(features, dict)

    expected_features = {
        "width",
        "height",
        "aspect_ratio",
        "brightness_mean",
        "brightness_std",
        "entropy",
        "edge_density",
        "noise_std",
        "local_variation",
    }

    assert expected_features.issubset(features.keys())


def test_feature_values_are_numeric():
    features = extract_forensic_features(GENUINE_IMAGE)

    for name, value in features.items():
        assert isinstance(value, float), name


def test_missing_image_raises_error():
    with pytest.raises(FileNotFoundError):
        extract_forensic_features(
            "data/samples/does_not_exist.png"
        )


def test_genuine_and_tampered_can_be_processed():
    genuine = extract_forensic_features(GENUINE_IMAGE)
    tampered = extract_forensic_features(TAMPERED_IMAGE)

    assert genuine.keys() == tampered.keys()