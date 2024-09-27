chrome.runtime.onInstalled.addListener(() =>
{
	// Page actions are disabled by default and enabled on select tabs
	chrome.action.disable();

	// Clear all rules to ensure only our expected rules are set
	    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        let rule = {
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        hostContains: '.amazon.',
                        urlMatches: '^https://([^/.:]+\\.)*amazon(\\.[^/.:]{1,3}){1,2}/'
                    }
                })
            ],
            actions: [new chrome.declarativeContent.ShowAction()],
        };
        chrome.declarativeContent.onPageChanged.addRules([rule]);
    });
});
