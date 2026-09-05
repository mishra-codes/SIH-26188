from pathlib import Path

from ml.src.inference.passport_verification import verify_passport_identity


PROJECT_ROOT = Path(__file__).resolve().parents[3]
GENUINE_DIR = PROJECT_ROOT / "data" / "demo_dataset" / "genuine"


def main():
    results = []

    for document_dir in sorted(GENUINE_DIR.iterdir()):
        if not document_dir.is_dir():
            continue

        image_path = document_dir / "passport.png"

        if not image_path.exists():
            continue

        print(f"Testing {document_dir.name}...")

        try:
            result = verify_passport_identity(str(image_path))

            mrz = result["mrz"]

            results.append({
                "document": document_dir.name,
                "ocr": result["ocr"]["status"],
                "mrz": mrz["status"],
                "valid": mrz.get("valid", False),
                "errors": mrz.get("errors", []),
            })

        except Exception as exc:
            results.append({
                "document": document_dir.name,
                "ocr": "ERROR",
                "mrz": "ERROR",
                "valid": False,
                "errors": [str(exc)],
            })

    print()
    print("=== DEMO OCR/MRZ TEST ===")
    print()

    passed = 0

    for result in results:
        status = "PASS" if result["valid"] else "FAIL"

        print(
            f"{result['document']:20s} "
            f"OCR={result['ocr']:5s} "
            f"MRZ={result['mrz']:5s} "
            f"RESULT={status}"
        )

        if result["errors"]:
            for error in result["errors"]:
                print(f"    - {error}")

        if result["valid"]:
            passed += 1

    print()
    print(f"Valid MRZs: {passed}/{len(results)}")


if __name__ == "__main__":
    main()