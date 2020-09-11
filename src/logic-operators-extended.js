/**
🔀
@file logic-operators-extended
@summary adds conditional logic operators
@version auto
@author @mildmojo

@description
Adds conditional logic operators:
  - !== (not equal to)
  - && (and)
  - || (or)
  - % (modulo)

Examples: candlecount > 5 && haslighter == 1
          candlecount > 5 && papercount > 1 && isIndoors
          haslighter == 1 || hasmatches == 1
          candlecount > 5 && candlecount !== 666
          candlecount > 5 &&! droppedlighter
          droppedlighter ||! hasmatches

NOTE: The combining operators (&&, ||, &&!, ||!) have lower precedence than
      all other math and comparison operators, so it might be hard to write
      tests that mix and match these new operators and have them evaluate
      correctly. If you're using multiple `&&` and `||` operators in one
      condition, be sure to test every possibility to make sure it behaves
      the way you want.
*/

import {
	inject,
} from './helpers/kitsy-script-toolkit';

function andExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal && rVal);
		});
	});
}

function orExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal || rVal);
		});
	});
}

function notEqExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal !== rVal);
		});
	});
}

function modExp(environment, left, right, onReturn) {
	right.Eval(environment, function (rVal) {
		left.Eval(environment, function (lVal) {
			onReturn(lVal % rVal);
		});
	});
}

inject(/(operatorMap\.set\("-", subExp\);)/, `
	$1
	operatorMap.set("&&", ${andExp.toString()});
	operatorMap.set("||", ${orExp.toString()});
	operatorMap.set("!==", ${notEqExp.toString()});
	operatorMap.set("%", ${modExp.toString()});
`);
inject(
	/(Operators : \[)(.+\],)/,
	'$1 "!==", "&&", "||", "&&!", "||!", "%", $2',
);
// End of logic operators mod
