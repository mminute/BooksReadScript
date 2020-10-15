const inquirer = require("inquirer");

async function getValidTag(tag) {
  const { isNewTag } = await inquirer.prompt({
    message: `'${tag}' not found. Is this tag correct?`,
    name: 'isNewTag',
    type: 'confirm',
  });

  if (isNewTag) {
    return tag;
  }

  const { updatedTag } = await inquirer.prompt({
    message: 'Enter the correct tag:',
    name: 'updatedTag',
    type: 'input',
  });

  if (canonicalTags.includes(updatedTag)) {
    return updatedTag;
  } else {
    return await getValidTag(updatedTag);
  }
}

module.exports = getValidTag;
