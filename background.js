chrome.runtime.onInstalled.addListener(function ()
{
	chrome.storage.sync.set({ copyAutomatically: true });
	chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		if (changeInfo.url) {
			if (tab.url.includes('amazon.com')) {
				chrome.action.enable(tabId);
			} else {
				chrome.action.disable(tabId);
			}
		}
	});
});
