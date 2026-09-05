from pathlib import Path

from ml.src.inference.ocr_service import extract_passport_ocr


IMAGE_PATH = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "samples"
    / "genuine"
    / "doc_0001_genuine.png"
)


def main():
    result = extract_passport_ocr(str(IMAGE_PATH))

    print("\n=== EXTRACTED TEXT ===")

    for text in result["texts"]:
        print(text)

    print("\n=== MRZ LINES ===")

    for line in result["mrz_lines"]:
        print(line)


if __name__ == "__main__":
    main()