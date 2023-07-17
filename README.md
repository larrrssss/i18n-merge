# I18n Merge GitHub Action

This action takes multiple translation files and combines them into a single output file, making it easier to manage internationalization (i18n) resources for your projects.

## Usage

To use this action, you can add the following snippet to your GitHub Actions workflow file (e.g., `.github/workflows/i18n-merge.yml`):

```yaml
name: I18n Merge

on:
  push:
    branches:
      - main

jobs:
  merge_i18n:
    name: Merge i18n translation files
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3
        with:
          ref: main

      - name: Merge Locale Files
        uses: larrrssss/i18n-merge@v1.0.1
        id: merge
        with:
          workspace: ${{ github.workspace }}
          root: '/'
          output_file_path: 'output.json'
          locales_file_path: 'locales.json'
          base_file_name: 'base.json'

      # Push the output file to the main branch. You can update this step to handle the output file with your own custom logic.
      - name: Push Output File
        if: ${{ steps.merge.outputs.changes_detected == '1' }}
        env:
          CI_COMMIT_MESSAGE: Continuous Integration I18n Translation Merge
          CI_COMMIT_AUTHOR: Continuous Integration
        run: |
          git config --global user.name "${{ env.CI_COMMIT_AUTHOR }}"
          git config --global user.email "username@users.noreply.github.com"
          git add .
          git commit -a -m "${{ env.CI_COMMIT_MESSAGE }}"
          git push
```

Note that the `username` in `username@users.noreply.github.com` needs to be replaced.

### Workflow Permissions

This workflow requires read and write permissions for the repository. Enable read and write permissions following `Settings` → `Actions` → `General`

![Workflow Permissions](/docs/workflow_permissions.png)

## Inputs

| Name                 | Description                         | Required | Default         |
|:---------------------|-------------------------------------|:--------:|-----------------|
| `workspace`          | GitHub `$GITHUB_WORKSPACE` variable | &check;  |                 |
| `root`               | Change the root path for all paths  | &cross;  | `/`             |
| `output_file_path`   | Path for the output file            | &cross;  | `output.json`   |
| `locales_file_path`  | Path for the root locales file      | &cross;  | `locales.json`  |
| `base_file_name`     | Name of the base file               | &cross;  | `base.json`     |
| `exclude`            | Define a glob pattern to exclude paths from merging. This is based on the `root` path. | &cross; |  |

## Outputs

- `changes_detected`: Whether there are new changes.

## License

This action is licensed under the [MIT License](LICENSE).
