const inquirer = require("inquirer");

async function getNewTagsFiction(newTags) {
  const processed = []
  for (const tag of newTags) {
    const { isFiction } = await inquirer.prompt({
      message: `Is '${tag}' a fiction tag?`,
      name: 'isFiction',
      type: 'confirm',
    });

    processed.push({ tag, isFiction });
  }

  return processed;
}

module.exports = getNewTagsFiction;
