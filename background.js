chrome.runtime.onInstalled.addListener(() =>
{
	// Page actions are disabled by default and enabled on select tabs
	chrome.action.disable();

	// Clear all rules to ensure only our expected rules are set
	chrome.declarativeContent.onPageChanged.removeRules(undefined, () =>
	{
		let rule = {
			conditions: [],
			actions: [new chrome.declarativeContent.ShowAction()],
		};
		let domains = [
			'amazon.ae',
			'amazon.ca',
			'amazon.cn',
			'amazon.co.jp',
			'amazon.co.uk',
			'amazon.co.za',
			'amazon.com',
			'amazon.com.au',
			'amazon.com.be',
			'amazon.com.br',
			'amazon.com.mx',
			'amazon.com.tr',
			'amazon.de',
			'amazon.eg',
			'amazon.es',
			'amazon.fr',
			'amazon.in',
			'amazon.it',
			'amazon.nl',
			'amazon.pl',
			'amazon.sa',
			'amazon.se',
			'amazon.sg'
		];

		for (let i = 0; i < domains.length; i++)
		{
			rule.conditions.push(new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: domains[i] } }));
		}
		chrome.declarativeContent.onPageChanged.addRules([rule]);
	});
});
