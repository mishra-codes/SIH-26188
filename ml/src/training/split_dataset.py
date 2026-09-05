from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split


PROJECT_ROOT = Path(__file__).resolve().parents[3]

MANIFEST_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "demo_dataset_manifest.csv"
)

OUTPUT_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "demo_dataset_manifest_split.csv"
)

RANDOM_STATE = 42


def split_dataset(
    manifest_path: Path = MANIFEST_PATH,
    output_path: Path = OUTPUT_PATH,
) -> pd.DataFrame:

    if not manifest_path.exists():
        raise FileNotFoundError(
            f"Dataset manifest not found: {manifest_path}"
        )

    df = pd.read_csv(manifest_path)

    required_columns = {
        "image_path",
        "label",
        "tampering_type",
        "document_id",
        "split",
    }

    missing = required_columns - set(df.columns)

    if missing:
        raise ValueError(
            f"Missing required columns: {sorted(missing)}"
        )

    document_ids = df["document_id"].unique()

    if len(document_ids) < 3:
        raise ValueError(
            "At least 3 unique documents are required "
            "for train/validation/test splitting."
        )

    train_ids, temp_ids = train_test_split(
        document_ids,
        test_size=0.4,
        random_state=RANDOM_STATE,
    )

    validation_ids, test_ids = train_test_split(
        temp_ids,
        test_size=0.5,
        random_state=RANDOM_STATE,
    )

    df["split"] = "train"

    df.loc[
        df["document_id"].isin(validation_ids),
        "split",
    ] = "validation"

    df.loc[
        df["document_id"].isin(test_ids),
        "split",
    ] = "test"

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    df.to_csv(
        output_path,
        index=False,
    )

    return df


if __name__ == "__main__":

    result = split_dataset()

    print()
    print("=== DATASET SPLIT COMPLETED ===")
    print()

    print("Documents:")
    print(
        result.groupby("split")["document_id"]
        .nunique()
    )

    print()
    print("Images:")
    print(
        result["split"]
        .value_counts()
    )

    print()
    print("Class distribution:")
    print(
        result.groupby(
            ["split", "label"]
        ).size()
    )