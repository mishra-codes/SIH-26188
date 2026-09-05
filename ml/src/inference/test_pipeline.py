from pathlib import Path

from PIL import Image

from ml.src.inference.pipeline import analyze_passport


def test_pipeline_requires_existing_image():
    missing_file = "does_not_exist.jpg"

    try:
        analyze_passport(missing_file)
        assert False, "Expected FileNotFoundError"
    except FileNotFoundError:
        assert True


def test_pipeline_contract(tmp_path):
    test_image = tmp_path / "test_passport.jpg"

    # Create a valid image fixture instead of an empty file.
    image = Image.new("RGB", (512, 512), color="white")
    image.save(test_image, format="JPEG")

    result = analyze_passport(str(test_image))
    output = result.to_dict()

    assert output["model_version"] in {"poc-v0.2", "poc-v0.3-demo"}
    assert "tampering" in output
    assert "anomaly" in output
    assert "face" in output

    assert "score" in output["tampering"]
    assert "status" in output["tampering"]
    assert "signals" in output["tampering"]