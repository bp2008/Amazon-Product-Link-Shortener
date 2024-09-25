///////////////////////
// Utility Functions //
///////////////////////
function SelectText(node)
{
	node = document.getElementById(node);

	if (document.body.createTextRange)
	{
		const range = document.body.createTextRange();
		range.moveToElementText(node);
		range.select();
	}
	else if (window.getSelection)
	{
		const selection = window.getSelection();
		const range = document.createRange();
		range.selectNodeContents(node);
		selection.removeAllRanges();
		selection.addRange(range);
	}
	else
	{
		console.warn("Could not select text in node: Unsupported browser.");
	}
}

var hideCopiedTextTimeout = null;
async function CopyToClipboard(str)
{
	try
	{
		await navigator.clipboard.writeText(str);
		showCopied();
	}
	catch (ex)
	{
		console.error(ex);
		showCopyFailed();
	}
}
var ele_copied = document.getElementById("copied");
function showCopied()
{
	if (ele_copyFailed)
		ele_copyFailed.style.display = "none";
	if (ele_copied)
	{
		ele_copied.style.display = "inline";
		clearTimeout(hideCopiedTextTimeout);
		hideCopiedTextTimeout = setTimeout(function ()
		{
			ele_copied.style.display = "none";
		}, 2000);
	}
}
var ele_copyFailed = document.getElementById("copyFailed");
function showCopyFailed()
{
	if (ele_copied)
		ele_copied.style.display = "none";
	if (ele_copyFailed)
	{
		ele_copyFailed.style.display = "inline";
		clearTimeout(hideCopiedTextTimeout);
		hideCopiedTextTimeout = setTimeout(function ()
		{
			ele_copyFailed.style.display = "none";
		}, 2000);
	}
}
async function CreateCheckboxSetting(settingName, defaultValue, onChange)
{
	var cbs = new CheckboxSetting(settingName, onChange);
	var result = await chrome.storage.sync.get([settingName]);
	cbs.set(result[settingName]);
	cbs.attachChangeListener(onChange);
	return cbs;
}
function CheckboxSetting(settingName, defaultValue)
{
	var ele_checkbox = document.getElementById(settingName);
	this.get = function ()
	{
		return ele_checkbox.checked;
	}
	this.set = function (value)
	{
		if (typeof value === "undefined")
			ele_checkbox.checked = defaultValue;
		else
			ele_checkbox.checked = !!value;
		if (typeof onChange === "function")
			onChange();
	}
	this.attachChangeListener = function (onChange)
	{
		ele_checkbox.addEventListener("change", function (e)
		{
			var obj = {};
			obj[settingName] = e.target.checked;
			chrome.storage.sync.set(obj);
			if (typeof onChange === "function")
				onChange();
		});
	}
}
////////////////////////////////
// Extension Primary Behavior //
////////////////////////////////
var ele_getLink = document.getElementById("getLink");
ele_getLink.addEventListener("click", CopyLinkToClipboard);

var ele_myLink = document.getElementById("myLink");

var lastUrl = null;
var link = null;

async function CopyLinkToClipboard()
{
	if (link)
		await CopyToClipboard(link);
	else
	{
		console.log("Unable to copy shortened amazon product link.  Link is not assigned.");
		showCopyFailed();
	}
}

async function produceShortLink()
{
	if (!lastUrl)
		return; // The extension hasn't been activated yet

	// Parse URL
	var m = lastUrl.match(/\/(?:dp|gp\/product)\/([^\/?#]+)/i);
	if (!m)
	{
		console.log("Unexpected product URL format", lastUrl);
		link = null;
		ele_myLink.innerText = "URL not recognized as an Amazon product.";
		ele_getLink.style.display = "none";
		return;
	}

	// Create Link
	var lastUrlAsURL = new URL(lastUrl);
	if (noWWW.get() && lastUrlAsURL.hostname.match(/^www\./i))
	{
		lastUrlAsURL.hostname = lastUrlAsURL.hostname.substring(4);
	}
	var origin = lastUrlAsURL.origin;
	var asin = m[1];
	link = origin + "/dp/" + asin;

	// Assign link text
	ele_myLink.innerText = link;
	SelectText("myLink");

	if (copyAutomatically.get())
	{
		await CopyLinkToClipboard();
	}

	// Generate QR code
	document.getElementById("qrcode").innerHTML = "";
	var qrcode = new QRCode(document.getElementById("qrcode"), {
		text: link,
		width: 200,
		height: 200,
		colorDark: "#000000",
		colorLight: "#ffffff",
		correctLevel: QRCode.CorrectLevel.H
	});
}

// Perform setup activities

var copyAutomatically = await CreateCheckboxSetting("copyAutomatically", true, produceShortLink);
var noWWW = await CreateCheckboxSetting("noWWW", true, produceShortLink);

chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs)
{
	if (tabs.length > 0)
	{
		lastUrl = tabs[0].url;
		await produceShortLink();
	}
});