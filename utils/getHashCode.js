// https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/

function hashCode(str) {
	let hash = 0;

	if (str.length == 0) {
		return hash;
	}

	for (i = 0; i < str.length; i++) {
		char = str.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

function getHashCode(str) {
  return Math.abs(hashCode(str));
}

module.exports = getHashCode;
