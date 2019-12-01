# GitHub Sort Forks Action

![](https://github.com/actioncloud/sort-forks-action/workflows/Test%20sort%20forks/badge.svg)


## Usage

```yaml
# A workflow config example
name: Test sort forks

on:
  # a cron schedule to run periodically
  schedule:
    - cron: '0 * * * *'

jobs:
  test_sort_forks:
    runs-on: ubuntu-latest
    name: A job to test sort forks
    steps:
    - name: Checkout
      uses: actions/checkout@v1
    - name: Sort forks
      id: sort
      uses: ./
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
    # you need git commit to push the forks data to the folder: .github/actioncloud
    - name: Git commit
      run: |
        git config --global user.email "idegorepl@gmail.com"
        git config --global user.name "ActionCloud Bot"
        git add .
        git commit -m "Update forks data"
    - name: Push changes
      uses: ad-m/github-push-action@master
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
    # you can get badge code of ActionCloud viewer App, and click it to view your data
    - name: Check output
      run: echo '${{ steps.sort.outputs.actioncloud-badge }}'
```

## GitHub Sort Forks Viewer

The Action will store the forked repos data into your repository, and you need a web view page to see the chart. The viewer page is hosted in `actioncloud.io`, the url is `https://free.actioncloud.io/apps/sort-forks?owner=<your_owner_name>&repo=<your_repo_name>`.

You can put a badge in your README file:

[![](https://img.shields.io/badge/ActionCloud%20App-Sort%20Forks-blue)](https://free.actioncloud.io/apps/sort-forks?owner=actioncloud&repo=sort-forks-action)

```pre
# remember to change the owner_name and repo_name to yours:

[![](https://img.shields.io/badge/ActionCloud%20App-Sort%20Forks-blue)](https://free.actioncloud.io/apps/sort-forks?owner=<owner_name>&repo=<repo_name>)
```

### Page preview

![github sort forks preview](https://raw.githubusercontent.com/actioncloud/actioncloud.github.io/master/apps/sort-forks/images/sortForksPreview.png)
