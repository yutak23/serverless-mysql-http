import type { UserConfig, Plugin } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

const redminePlugin: Plugin = {
	rules: {
		'redmine-rule': ({ subject }) => {
			const pattern = / refs#\d+$/;

			if (!subject) return [false, `Your subject should not empty`];
			return [new RegExp(pattern).test(subject), `Your subject should contain suffix for redmine`];
		}
	}
};

const Configuration: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'subject-case': [
			RuleConfigSeverity.Warning,
			'never',
			['sentence-case', 'start-case', 'pascal-case', 'upper-case']
		],
		'redmine-rule': [RuleConfigSeverity.Warning, 'always']
	},
	plugins: [redminePlugin]
};

export default Configuration;
