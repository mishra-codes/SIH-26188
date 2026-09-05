from pathlib import Path
from paddleocr import PaddleOCR


class PassportOCR:
    def __init__(self):
        self.ocr = PaddleOCR(
            lang="en",
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
        )

    def extract_text(self, image_path: str) -> list[str]:
        path = Path(image_path)

        if not path.exists():
            raise FileNotFoundError(f"Document image not found: {image_path}")

        result = self.ocr.predict(str(path))

        texts = []

        for page in result:
            page_data = page

            rec_texts = page_data.get("rec_texts", [])

            for text in rec_texts:
                cleaned = str(text).strip()

                if cleaned:
                    texts.append(cleaned)

        return texts

    def extract_mrz(self, texts: list[str]) -> list[str]:
        mrz_lines = []

        for text in texts:
            cleaned = text.replace(" ", "").upper()

            # MRZ passport lines are normally long and contain
            # '<' filler characters.
            if len(cleaned) >= 30 and "<" in cleaned:
                mrz_lines.append(cleaned)

        return mrz_lines


def extract_passport_ocr(image_path: str) -> dict:
    ocr = PassportOCR()

    texts = ocr.extract_text(image_path)
    mrz_lines = ocr.extract_mrz(texts)

    return {
        "texts": texts,
        "mrz_lines": mrz_lines,
    }