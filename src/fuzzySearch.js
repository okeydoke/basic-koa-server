/*eslint no-labels: 0*/
/**
 * fast fuzzy search algorithm
 * https://github.com/bevacqua/fuzzysearch
 * @param  {String} needle   value to search for
 * @param  {String} haystack value to search on
 * @return {Boolean}
 */
export default function (needle, haystack) {
	var tlen = haystack.length;
	var qlen = needle.length;
	if (qlen > tlen) {
		return false;
	}
	if (qlen === tlen) {
		return needle === haystack;
	}
	var i;
	var j;
	outer: for (i = 0, j = 0; i < qlen; i++) {
		var nch = needle.charCodeAt(i);
		while (j < tlen) {
			if (haystack.charCodeAt(j++) === nch) {
				continue outer;
			}
		}
		return false;
	}
	return true;
}
