const core = require('@actions/core');
const fs = require('fs');
const fetch = require("node-fetch");

const githubToken = core.getInput('github-token');
const currentRepo = process.env.GITHUB_REPOSITORY;
var currentRepoIsParent = false;

async function run() {
  const parentRepoUrl = await getParentRepoUrl();
  const parentRepoData = await getParentRepoData(parentRepoUrl);
  const forkedReposData = await getForkedReposData(parentRepoUrl, parentRepoData);
  dumpData(forkedReposData);
  printBadgeLink();
}

run();


function getParentRepoUrl() {
  return getRepoInfo(repoApiUrl(currentRepo))
    .then(data => {
      if (data.fork) {
        return data.parent.url;
      }
      // if it's not a forked repo, take itself as a parent
      currentRepoIsParent = true;
      return data.url;
    })
    .catch(err => { console.log(err) });
}

function getParentRepoData(url) {
  return getRepoInfo(url)
    .then(data => {
      return {
        repo_name: data.full_name,
        pushed_at: data.pushed_at
      }
    })
    .catch(err => { console.log(err) });
}

function getForkedReposData(repoUrl, parentRepoData) {
  return getRepoInfo(repoForksApiUrl(repoUrl))
    .then(data => {
      var allRepos = data.map(repo => {
        return {
          repo_name: repo.full_name,
          pushed_at: repo.pushed_at
        };
      });
      // remove current repo from allRepos if currentRepo is not parent
      if (!currentRepoIsParent) {
        const index = allRepos.indexOf(currentRepo);
        allRepos.splice(index, 1);
      }
      allRepos.sort((a,b) => (b.pushed_at > a.pushed_at) ? 1 : ((a.pushed_at > b.pushed_at) ? -1 : 0));
      return {
        parent_repo: parentRepoData.repo_name,
        data: allRepos
      };
    })
    .catch(err => { console.log(err) });
}

function getRepoInfo(url) {
  return fetch(url)
    .then(resp => { return resp.json() })
    .catch(err => { console.log(err) });
}

function repoForksApiUrl(repoUrl) {
  return `${repoUrl}/forks`;
}

function repoApiUrl(repo) {
  return `https://api.github.com/repos/${repo}`;
}

function dumpData(data) {
  const dataDir = `./.github/actioncloud/sort-forks`;
  if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dataFilePath = dataDir + '/data.json';
  const jsonData = JSON.stringify(data);
  fs.writeFile(dataFilePath, jsonData, (err) => {
    if (err) throw err;
  });
}

function printBadgeLink() {
  const repoInfo = currentRepo.split("/");
  const repoOwner = repoInfo[0];
  const repoName = repoInfo[1];
  const actioncloudBadge = '[![](https://img.shields.io/badge/ActionCloud%20App-Sort%20Forks-blue)](https://free.actioncloud.io/apps/sort-forks?owner=' + repoOwner + '&repo=' + repoName + ')';
  console.log(`::set-output name=actioncloud-badge::${actioncloudBadge}`)
}
