#!/usr/bin/env bash

rm -rf flat
ROOT=contracts/

TOKEN_REGISTRY=tokens/
TOKEN_REGISTRY_FULLPATH="$ROOT""$TOKEN_REGISTRY"

FACTORY=factory/
FACTORY_FULLPATH="$ROOT""$FACTORY"

POS=pos/
POS_FULLPATH="$ROOT""$POS"

FLAT=flat/

iterate_sources() {
  files=$(ls "$1"*.sol)
  for file in $files; do
    file_name=$(basename "$file")
    hardhat flatten "$file" > "$2""$file_name"
  done
}

mkdir -p "$FLAT""$FACTORY";

iterate_sources "$FACTORY_FULLPATH" "$FLAT""$FACTORY"

mkdir -p "$FLAT""$TOKEN_REGISTRY";

iterate_sources "$TOKEN_REGISTRY_FULLPATH" "$FLAT""$TOKEN_REGISTRY"

mkdir -p "$FLAT""$POS";

iterate_sources "$POS_FULLPATH" "$FLAT""$POS"