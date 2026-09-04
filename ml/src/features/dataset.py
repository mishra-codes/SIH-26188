from dataclasses import dataclass
from pathlib import Path

import pandas as pd


@dataclass
class DocumentSample:
    image_path: Path
    label: int
    tampering_type: str
    document_id: str
    split: str


REQUIRED_COLUMNS = {
    "image_path",
    "label",
    "tampering_type",
    "document_id",
    "split",
}


def load_manifest(manifest_path: str | Path) -> list[DocumentSample]:
    manifest_path = Path(manifest_path)

    if not manifest_path.exists():
        raise FileNotFoundError(
            f"Dataset manifest not found: {manifest_path}"
        )

    dataframe = pd.read_csv(manifest_path)

    missing_columns = REQUIRED_COLUMNS - set(dataframe.columns)

    if missing_columns:
        raise ValueError(
            f"Manifest is missing columns: {sorted(missing_columns)}"
        )

    samples = []

    for _, row in dataframe.iterrows():
        samples.append(
            DocumentSample(
                image_path=Path(row["image_path"]),
                label=int(row["label"]),
                tampering_type=str(row["tampering_type"]),
                document_id=str(row["document_id"]),
                split=str(row["split"]),
            )
        )

    return samples