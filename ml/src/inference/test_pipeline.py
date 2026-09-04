from pathlib import Path

from ml.src.inference.pipeline import analyze_passport


def test_pipeline_requires_existing_image():
    missing_file = "does_not_exist.jpg"

    try:
        analyze_passport(missing_file)
        assert False, "Expected FileNotFoundError"
    except FileNotFoundError:
        assert True


def test_pipeline_contract():
    test_image = Path("test_passport.jpg")

    test_image.touch()

    result = analyze_passport(str(test_image))
    output = result.to_dict()

    assert output["model_version"] == "poc-v1"
    assert "tampering" in output
    assert "anomaly" in output
    assert "face" in output

    test_image.unlink()