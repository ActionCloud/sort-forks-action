const core = require('@actions/core');
const fs = require('fs');
const fetch = require("node-fetch");

const githubToken = core.getInput('github-token');
const currentRepo = process.env.GITHUB_REPOSITORY;

async function run() {
  const parentRepoUrl = await getParentRepoUrl();
  const parentRepoData = await getParentRepoData(parentRepoUrl);
  const forkedReposData = await getForkedReposData(parentRepoUrl, parentRepoData);
  dumpData(forkedReposData);
}

run();


function getParentRepoUrl() {
  return getRepoInfo(repoApiUrl(currentRepo))
    .then(data => {
      return data.parent.url;
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
      let allRepos = [];
      data.forEach(repo => {
        const repoName = repo.full_name;
        if (repoName !== currentRepo) {
          allRepos.push({
            repo_name: repo.full_name,
            pushed_at: repo.pushed_at
          });
        }
      });
      return {
        parent_repo: parentRepoData.repo_name,
        data: allRepos.push(parentRepoData).sort((a, b) => b - a)
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
