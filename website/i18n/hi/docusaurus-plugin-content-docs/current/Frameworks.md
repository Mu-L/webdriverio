---
id: frameworks
title: फ्रेमवर्क
---

WebdriverIO Runner has built-in support for [Mocha](http://mochajs.org/), [Jasmine](http://jasmine.github.io/), and [Cucumber.js](https://cucumber.io/). You can also integrate it with 3rd-party open-source frameworks, such as [Serenity/JS](#using-serenityjs).

:::tip Integrating WebdriverIO with test frameworks
To integrate WebdriverIO with a test framework, you need an adapter package available on NPM. Note that the adapter package must be installed in the same location where WebdriverIO is installed. इसलिए, यदि आपने WebdriverIO को विश्व स्तर पर स्थापित किया है, तो विश्व स्तर पर एडेप्टर पैकेज को भी स्थापित करना सुनिश्चित करें।
:::

Integrating WebdriverIO with a test framework lets you access the WebDriver instance using the global `browser` variable in your spec files or step definitions. Note that WebdriverIO will also take care of instantiating and ending the Selenium session, so you don't have to do it yourself.

## मोचा का उपयोग करना

सबसे पहले, एनपीएम से एडॉप्टर पैकेज इनस्टॉल करें:

```bash npm2yarn
एनपीएम इंस्टॉल @wdio/mocha-framework --save-dev
```

डिफ़ॉल्ट रूप से WebdriverIO एक [अभिकथन लाइब्रेरी](assertion) प्रदान करता है जो अंतर्निहित है जिसमें आप तुरंत प्रारंभ कर सकते हैं:

```js
describe('my awesome website', () => {
    it('should do some assertions', async () => {
        await browser.url('https://webdriver.io')
        await expect(browser).toHaveTitle('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO')
    })
})
```

WebdriverIO Mocha के `BDD` (डिफ़ॉल्ट), `TDD`और `QUnit` [इंटरफेस](https://mochajs.org/#interfaces)का समर्थन करता है।

यदि आप अपने विनिर्देशों को TDD शैली में लिखना पसंद करते हैं, तो अपने `mochaOpts` कॉन्फ़िग में `ui` गुण को `tdd`पर सेट करें। अब आपकी टेस्ट फाइलें इस तरह लिखी जानी चाहिए:

```js
suite('my awesome website', () => {
    test('should do some assertions', async () => {
        await browser.url('https://webdriver.io')
        await expect(browser).toHaveTitle('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO')
    })
})
```

यदि आप अन्य मोचा-विशिष्ट सेटिंग्स को परिभाषित करना चाहते हैं, तो आप इसे अपनी कॉन्फ़िगरेशन फ़ाइल में `mochaOpts` कुंजी के साथ कर सकते हैं। सभी विकल्पों की सूची [मोचा परियोजना की वेबसाइट](https://mochajs.org/api/mocha)पर देखी जा सकती है।

__नोट:__ WebdriverIO मोचा में `done` कॉलबैक के बहिष्कृत उपयोग का समर्थन नहीं करता है:

```js
it('should test something', (done) => {
    done() // throws "done is not a function"
})
```

### मोचा विकल्प

आपके Mocha परिवेश को कॉन्फ़िगर करने के लिए आपके `wdio.conf.js` में निम्न विकल्प लागू किए जा सकते हैं। __नोट:__ सभी विकल्प समर्थित नहीं हैं, उदाहरण के लिए `parallel` विकल्प को लागू करने से त्रुटि होगी क्योंकि WDIO टेस्टरनर के पास समानांतर में परीक्षण चलाने का अपना तरीका है। You can pass these framework options as arguments, e.g.:

```sh
wdio run wdio.conf.ts --mochaOpts.grep "my test" --mochaOpts.bail --no-mochaOpts.checkLeaks
```

This will pass along the following Mocha options:

```ts
{
    grep: ['my-test'],
    bail: true
    checkLeacks: false
}
```

The following Mocha options are supported:

#### require
जब आप कुछ बुनियादी कार्यक्षमता (वेबड्राइवरआईओ फ्रेमवर्क विकल्प) को जोड़ना या बढ़ाना चाहते हैं तो `require` विकल्प उपयोगी है।

Type: `string|string[]`<br /> Default: `[]`

#### compilers
फ़ाइलों को संकलित करने के लिए दिए गए मॉड्यूल(s) का उपयोग करें। कंपाइलर्स को आवश्यकता से पहले शामिल किया जाएगा (WebdriverIO फ्रेमवर्क विकल्प)।

Type: `string[]`<br /> Default: `[]`

#### allowUncaught
अनकही त्रुटियों का प्रचार करें।

Type: `boolean`<br /> Default: `false`

#### bail
पहले टेस्ट में फेल होने के बाद बेल

Type: `boolean`<br /> Default: `false`

#### checkLeaks
वैश्विक चर लीक के लिए जाँच करें।

Type: `boolean`<br /> Default: `false`

#### delay
देरी रूट सूट निष्पादन।

Type: `boolean`<br /> Default: `false`

#### fgrep
परीक्षण फ़िल्टर दिए गए स्ट्रिंग।

Type: `string`<br /> Default: `null`

#### forbidOnly
परीक्षण `only` सुइट में विफल रहता है।

Type: `boolean`<br /> Default: `false`

#### forbidPending
लंबित परीक्षण सूट विफल।

Type: `boolean`<br /> Default: `false`

#### fullTrace
विफलता पर पूर्ण स्टैकट्रेस।

Type: `boolean`<br /> Default: `false`

#### global
वैश्विक दायरे में अपेक्षित चर।

Type: `string[]`<br /> Default: `[]`

#### grep
टेस्ट फिल्टर रेगुलर एक्सप्रेशन दिया।

Type: `RegExp|string`<br /> Default: `null`

#### invert
उलटा परीक्षण फ़िल्टर मिलान करता है।

Type: `boolean`<br /> Default: `false`

#### retries
असफल परीक्षणों का पुन: प्रयास करने की संख्या।

Type: `number`<br /> Default: `0`

#### timeout
टाइमआउट थ्रेशोल्ड मान (मिलीसेकंड में).

Type: `number`<br /> Default: `30000`

## जेसमीन का प्रयोग

सबसे पहले, एनपीएम से एडॉप्टर पैकेज इनस्टॉल करें:

```bash npm2yarn
npm install @wdio/jasmine-framework --save-dev
```

फिर आप अपने कॉन्फ़िगरेशन में `jasmineOpts` गुण सेट करके अपने Jasmine परिवेश को कॉन्फ़िगर कर सकते हैं. सभी विकल्पों की सूची [मोचा परियोजना की वेबसाइट](https://jasmine.github.io/api/3.5/Configuration.html)पर देखी जा सकती है।

### जेसमीन विकल्प

निम्नलिखित विकल्पों को आपके `wdio.conf.js` में `cucumberOpts` गुण का उपयोग करके अपने खीरा वातावरण को कॉन्फ़िगर करने के लिए लागू किया जा सकता है: इन कॉन्फ़िगरेशन विकल्पों पर अधिक जानकारी के लिए, [जैस्मीन डॉक्स](https://jasmine.github.io/api/edge/Configuration)देखें। You can pass these framework options as arguments, e.g.:

```sh
wdio run wdio.conf.ts --jasmineOpts.grep "my test" --jasmineOpts.failSpecWithNoExpectations --no-jasmineOpts.random
```

This will pass along the following Mocha options:

```ts
{
    grep: ['my-test'],
    bail: true
    checkLeacks: false
}
```

The following Jasmine options are supported:

#### defaultTimeoutInterval
जैस्मीन संचालन के लिए डिफ़ॉल्ट टाइमआउट अंतराल।

Type: `number`<br /> Default: `60000`

#### helpers
चमेली चश्मा से पहले शामिल करने के लिए spec_dir के सापेक्ष फ़ाइलपथ (और ग्लोब) की सरणी।

Type: `string[]`<br /> Default: `[]`

#### requires
जब आप कुछ बुनियादी कार्यक्षमता को जोड़ना या बढ़ाना चाहते हैं तो `require` विकल्प उपयोगी है।

Type: `string[]`<br /> Default: `[]`

#### random
क्या विशिष्ट निष्पादन आदेश को यादृच्छिक बनाना है.

Type: `boolean`<br /> Default: `true`

#### seed
यादृच्छिककरण के आधार के रूप में उपयोग करने के लिए सीड। निष्पादन की शुरुआत में बीज को बेतरतीब ढंग से निर्धारित करने के लिए नल का कारण बनता है।

Type: `Function`<br /> Default: `null`

#### failSpecWithNoExpectations
क्या स्पेक्स को विफल करना है यदि यह कोई अपेक्षा नहीं रखता है। डिफ़ॉल्ट रूप से एक युक्ति जो बिना किसी अपेक्षा के चलती है, को पारित होने के रूप में रिपोर्ट किया जाता है। इसे सही पर सेट करने से ऐसे विनिर्देश की विफलता के रूप में रिपोर्ट की जाएगी।

Type: `boolean`<br /> Default: `false`

#### oneFailurePerSpec
क्या विशिष्टताओं को उत्पन्न करना है या नहीं, केवल एक अपेक्षा विफल है।

Type: `boolean`<br /> Default: `false`

#### specFilter
स्पेक्स फ़िल्टर उपयोग करने के लिए फंक्शन।

Type: `Function`<br /> Default: `(spec) => true`

#### grep
केवल इस स्ट्रिंग या regexp से मेल खाने वाले परीक्षण चलाएँ। (केवल तभी लागू होता है जब कोई कस्टम `specFilter` फ़ंक्शन सेट न हो)

Type: `string|Regexp`<br /> Default: `null`

#### invertGrep
यदि सही है तो यह मेल खाने वाले परीक्षणों को उलट देता है और केवल ऐसे परीक्षण चलाता है जो `grep`में प्रयुक्त अभिव्यक्ति से मेल नहीं खाते हैं। (केवल तभी लागू होता है जब कोई कस्टम `specFilter` फ़ंक्शन सेट न हो)

Type: `boolean`<br /> Default: `false`

## कुकुम्बर का उपयोग

सबसे पहले, एनपीएम से एडॉप्टर पैकेज इनस्टॉल करें:

```bash npm2yarn
npm install @wdio/cucumber-framework --save-dev
```

यदि आप कुकुम्बर का उपयोग करना चाहते हैं, तो `framework` प्रॉपर्टी को `cucumber` में `framework: 'cucumber'` जोड़कर [कॉन्फिग फाइल](configurationfile) ।

कुकुम्बर के लिए विकल्प कॉन्फ़िग फ़ाइल में `cucumberOpts`के साथ दिए जा सकते हैं। विकल्पों की पूरी सूची देखें [यहाँ](https://github.com/webdriverio/webdriverio/tree/main/packages/wdio-cucumber-framework#cucumberopts-options)।

कुकुम्बर के साथ जल्दी उठने और दौड़ने के लिए, हमारे [`cucumber-boilerplate`](https://github.com/webdriverio/cucumber-boilerplate) प्रोजेक्ट पर एक नज़र डालें, जो उन सभी चरण परिभाषाओं के साथ आता है जिनकी आपको घूरने की ज़रूरत है, और आप तुरंत फ़ीचर फ़ाइलें लिख रहे होंगे।

### कुकुम्बर विकल्प

निम्नलिखित विकल्पों को आपके `wdio.conf.js` में `cucumberOpts` गुण का उपयोग करके अपने खीरा वातावरण को कॉन्फ़िगर करने के लिए लागू किया जा सकता है:

:::tip Adjusting options through the command line
The `cucumberOpts`, such as custom `tags` for filtering tests, can be specified through the command line. This is accomplished by using the `cucumberOpts.{optionName}="value"` format.

For example, if you want to run only the tests that are tagged with `@smoke`, you can use the following command:

```sh
# When you only want to run tests that hold the tag "@smoke"
npx wdio run ./wdio.conf.js --cucumberOpts.tags="@smoke"
npx wdio run ./wdio.conf.js --cucumberOpts.name="some scenario name" --cucumberOpts.failFast
```

This command sets the `tags` option in `cucumberOpts` to `@smoke`, ensuring that only tests with this tag are executed.

:::

#### backtrace
त्रुटियों के लिए पूर्ण बैकट्रैक दिखाएं।

Type: `Boolean`<br /> Default: `true`

#### requireModule
किसी भी समर्थन फ़ाइल की आवश्यकता से पहले मॉड्यूल की आवश्यकता होती है।

Type: `string[]`<br /> Default: `[]`<br /> Example:

```js
cucumberOpts: {
    requireModule: ['@babel/register']
    // or
    requireModule: [
        [
            '@babel/register',
            {
                rootMode: 'upward',
                ignore: ['node_modules']
            }
        ]
    ]
 }
 ```

#### failFast
पहली बार असफल होने पर रन होने को रोक दें।

Type: `boolean`<br /> Default: `false`

#### name
केवल उन परिदृश्यों को निष्पादित करें जिनके नाम अभिव्यक्ति (दोहराने योग्य) से मेल खाते हैं।

Type: `RegExp[]`<br /> Default: `[]`

#### require
सुविधाओं को निष्पादित करने से पहले आपकी चरण परिभाषाओं वाली फ़ाइलों की आवश्यकता होती है। आप अपनी चरण परिभाषाओं के लिए एक ग्लोब भी निर्दिष्ट कर सकते हैं।

Type: `string[]`<br /> Default: `[]` Example:

```js
cucumberOpts: {
    require: [path.join(__dirname, 'step-definitions', 'my-steps.js')]
}
```

#### import
Paths to where your support code is, for ESM.

Type: `String[]`<br /> Default: `[]` Example:

```js
cucumberOpts: {
    import: [path.join(__dirname, 'step-definitions', 'my-steps.js')]
}
```

#### strict
कोई अपरिभाषित या लंबित चरण होने पर विफल।

Type: `boolean`<br /> Default: `false`

#### tags
अभिव्यक्ति से मेल खाने वाले टैग के साथ केवल सुविधाओं या परिदृश्यों को निष्पादित करें। अधिक विवरण के लिए कृपया [कुकुम्बर दस्तावेज़](https://docs.cucumber.io/cucumber/api/#tag-expressions) देखें।

Type: `String`<br /> Default: ``

#### timeout
स्टेप परिभाषाओं के लिए मिलीसेकंड में टाइमआउट।

Type: `Number`<br /> Default: `30000`

#### retry
Specify the number of times to retry failing test cases.

Type: `Number`<br /> Default: `0`

#### retryTagFilter
Only retries the features or scenarios with tags matching the expression (repeatable). This option requires '--retry' to be specified.

Type: `RegExp`

#### language
Default language for your feature files

Type: `String`<br /> Default: `en`

#### order
Run tests in defined / random order

Type: `String`<br /> Default: `defined`

#### format
Name and output file path of formatter to use. WebdriverIO primarily supports only the [Formatters](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md) that writes output to a file.

Type: `string[]`<br />

#### formatOptions
Options to be provided to formatters

Type: `object`<br />

#### tagsInTitle
Add cucumber tags to feature or scenario name

Type: `Boolean`<br /> Default: `false`

***Please note that this is a @wdio/cucumber-framework specific option and not recognized by cucumber-js itself***<br/>

#### ignoreUndefinedDefinitions
अपरिभाषित परिभाषाओं को चेतावनियों के रूप में मानें।

Type: `Boolean`<br /> Default: `false`

***Please note that this is a @wdio/cucumber-framework specific option and not recognized by cucumber-js itself***<br/>

#### failAmbiguousDefinitions
अस्पष्ट परिभाषाओं को त्रुटियों के रूप में मानें।

Type: `Boolean`<br /> Default: `false`

***Please note that this is a @wdio/cucumber-framework specific option and not recognized by cucumber-js itself***<br/>

#### tagExpression
Only execute the features or scenarios with tags matching the expression. Please see the [Cucumber documentation](https://docs.cucumber.io/cucumber/api/#tag-expressions) for more details.

Type: `String`<br /> Default: ``

***Please note that this option would be deprecated in future. Use [`tags`](#tags) config property instead***

#### profile
उपयोग करने के लिए प्रोफ़ाइल निर्दिष्ट करें।

Type: `string[]`<br /> Default: `[]`

***Kindly take note that only specific values (worldParameters, name, retryTagFilter) are supported within profiles, as `cucumberOpts` takes precedence. Additionally, when using a profile, make sure that the mentioned values are not declared within `cucumberOpts`.***

### Skipping tests in cucumber

ध्यान दें कि यदि आप `cucumberOpts`में उपलब्ध नियमित खीरा परीक्षण फ़िल्टरिंग क्षमताओं का उपयोग करके एक परीक्षण छोड़ना चाहते हैं, तो आप इसे क्षमताओं में कॉन्फ़िगर किए गए सभी ब्राउज़रों और उपकरणों के लिए करेंगे। यदि आवश्यक न हो तो सत्र शुरू किए बिना केवल विशिष्ट क्षमताओं के संयोजन के लिए परिदृश्यों को छोड़ने में सक्षम होने के लिए, वेबड्राइवरियो ककड़ी के लिए निम्नलिखित विशिष्ट टैग सिंटैक्स प्रदान करता है:

`@skip([condition])`

वेयर स्थिति उनके मानों के साथ क्षमताओं गुणों का एक वैकल्पिक संयोजन है, जब **सभी** से मेल खाते हैं, तो टैग किए गए परिदृश्य या सुविधा को छोड़ दिया जाता है। बेशक आप कई अलग-अलग परिस्थितियों में परीक्षण छोड़ने के लिए परिदृश्यों और सुविधाओं में कई टैग जोड़ सकते हैं।

आप `टैगएक्सप्रेशन' को बदले बिना परीक्षण छोड़ने के लिए '@tagExpression' का भी उपयोग कर सकते हैं। इस मामले में छोड़े गए टेस्ट को टेस्ट रिपोर्ट में प्रदर्शित किए जाएंगे।

यहाँ आपके पास इस सिंटैक्स के कुछ उदाहरण हैं:
- `@skip` या `@skip()`: टैग किए गए आइटम को हमेशा छोड़ देगा
- `@skip(browserName="chrome")`: क्रोम ब्राउज़र के विरुद्ध परीक्षण निष्पादित नहीं किया जाएगा।
- `@skip(browserName="firefox";platformName="linux")`: लिनक्स निष्पादन पर फ़ायरफ़ॉक्स में परीक्षण को छोड़ देगा।
- `@skip(browserName=["chrome","firefox"])`: टैग किए गए आइटम क्रोम और फ़ायरफ़ॉक्स दोनों ब्राउज़रों के लिए छोड़ दिए जाएंगे।
- `@skip(browserName=/i.*explorer/)`: capabilities with browsers matching the regexp will be skipped (like `iexplorer`, `internet explorer`, `internet-explorer`, ...).

### Import Step Definition Helper

स्टेप डेफिनिशन हेल्पर जैसे `Given`, `When` या `Then` या हुक का उपयोग करने के लिए, आपको `@cucumber/cucumber`से आयात करने का अनुमान है, उदाहरण के लिए:

```js
import { Given, When, Then } from '@cucumber/cucumber'
```

अब, यदि आप WebdriverIO से असंबंधित अन्य प्रकार के परीक्षणों के लिए पहले से ही ककड़ी का उपयोग करते हैं, जिसके लिए आप एक विशिष्ट संस्करण का उपयोग करते हैं, तो आपको इन सहायकों को WebdriverIO ककड़ी पैकेज से अपने e2e परीक्षणों में आयात करने की आवश्यकता होती है, जैसे:

```js
import { Given, When, Then, world, context } from '@wdio/cucumber-framework'
```

This ensures that you use the right helpers within the WebdriverIO framework and allows you to use an independent Cucumber version for other types of testing.

### Publishing Report

Cucumber provides a feature to publish your test run reports to `https://reports.cucumber.io/`, which can be controlled either by setting the `publish` flag in `cucumberOpts` or by configuring the `CUCUMBER_PUBLISH_TOKEN` environment variable. However, when you use `WebdriverIO` for test execution, there's a limitation with this approach. It updates the reports separately for each feature file, making it difficult to view a consolidated report.

To overcome this limitation, we've introduced a promise-based method called `publishCucumberReport` within `@wdio/cucumber-framework`. This method should be called in the `onComplete` hook, which is the optimal place to invoke it. `publishCucumberReport` requires the input of the report directory where cucumber message reports are stored.

You can generate `cucumber message` reports by configuring the `format` option in your `cucumberOpts`. It's highly recommended to provide a dynamic file name within the `cucumber message` format option to prevent overwriting reports and ensure that each test run is accurately recorded.

Before using this function, make sure to set the following environment variables:
- CUCUMBER_PUBLISH_REPORT_URL: The URL where you want to publish the Cucumber report. If not provided, the default URL 'https://messages.cucumber.io/api/reports' will be used.
- CUCUMBER_PUBLISH_REPORT_TOKEN: The authorization token required to publish the report. If this token is not set, the function will exit without publishing the report.

Here's an example of the necessary configurations and code samples for implementation:

```javascript
import { v4 as uuidv4 } from 'uuid'
import { publishCucumberReport } from '@wdio/cucumber-framework';

export const config = {
    // ... Other Configuration Options
    cucumberOpts: {
        // ... Cucumber Options Configuration
        format: [
            ['message', `./reports/${uuidv4()}.ndjson`],
            ['json', './reports/test-report.json']
        ]
    },
    async onComplete() {
        await publishCucumberReport('./reports');
    }
}
```

Please note that `./reports/` is the directory where `cucumber message` reports will be stored.

## Using Serenity/JS

[Serenity/JS](https://serenity-js.org?pk_campaign=wdio8&pk_source=webdriver.io) is an open-source framework designed to make acceptance and regression testing of complex software systems faster, more collaborative, and easier to scale.

For WebdriverIO test suites, Serenity/JS offers:
- [Enhanced Reporting](https://serenity-js.org/handbook/reporting/?pk_campaign=wdio8&pk_source=webdriver.io) - You can use Serenity/JS as a drop-in replacement of any built-in WebdriverIO framework to produce in-depth test execution reports and living documentation of your project.
- [Screenplay Pattern APIs](https://serenity-js.org/handbook/design/screenplay-pattern/?pk_campaign=wdio8&pk_source=webdriver.io) - To make your test code portable and reusable across projects and teams, Serenity/JS gives you an optional [abstraction layer](https://serenity-js.org/api/webdriverio?pk_campaign=wdio8&pk_source=webdriver.io) on top of native WebdriverIO APIs.
- [Integration Libraries](https://serenity-js.org/api/core/?pk_campaign=wdio8&pk_source=webdriver.io) - For test suites that follow the Screenplay Pattern, Serenity/JS also provides optional integration libraries to help you write [API tests](https://serenity-js.org/api/rest/?pk_campaign=wdio8&pk_source=webdriver.io), [manage local servers](https://serenity-js.org/api/local-server/?pk_campaign=wdio8&pk_source=webdriver.io), [perform assertions](https://serenity-js.org/api/assertions/?pk_campaign=wdio8&pk_source=webdriver.io), and more!

![Serenity BDD Report Example](/img/serenity-bdd-reporter.png)

### Installing Serenity/JS

To add Serenity/JS to an [existing WebdriverIO project](https://webdriver.io/docs/gettingstarted), install the following Serenity/JS modules from NPM:

```sh npm2yarn
npm install @serenity-js/{core,web,webdriverio,assertions,console-reporter,serenity-bdd} --save-dev
```

Learn more about Serenity/JS modules:
- [`@serenity-js/core`](https://serenity-js.org/api/core/?pk_campaign=wdio8&pk_source=webdriver.io)
- [`@serenity-js/web`](https://serenity-js.org/api/web/?pk_campaign=wdio8&pk_source=webdriver.io)
- [`@serenity-js/webdriverio`](https://serenity-js.org/api/webdriverio/?pk_campaign=wdio8&pk_source=webdriver.io)
- [`@serenity-js/assertions`](https://serenity-js.org/api/assertions/?pk_campaign=wdio8&pk_source=webdriver.io)
- [`@serenity-js/console-reporter`](https://serenity-js.org/api/console-reporter/?pk_campaign=wdio8&pk_source=webdriver.io)
- [`@serenity-js/serenity-bdd`](https://serenity-js.org/api/serenity-bdd/?pk_campaign=wdio8&pk_source=webdriver.io)

### Configuring Serenity/JS

To enable integration with Serenity/JS, configure WebdriverIO as follows:

<Tabs>
<TabItem value="wdio-conf-typescript" label="TypeScript" default>

```typescript title="wdio.conf.ts"
import { WebdriverIOConfig } from '@serenity-js/webdriverio';

export const config: WebdriverIOConfig = {

    // Tell WebdriverIO to use Serenity/JS framework
    framework: '@serenity-js/webdriverio',

    // Serenity/JS configuration
    serenity: {
        // Configure Serenity/JS to use the appropriate adapter for your test runner
        runner: 'cucumber',
        // runner: 'mocha',
        // runner: 'jasmine',

        // Register Serenity/JS reporting services, a.k.a. the "stage crew"
        crew: [
            // Optional, print test execution results to standard output
            '@serenity-js/console-reporter',

            // Optional, produce Serenity BDD reports and living documentation (HTML)
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],

            // Optional, automatically capture screenshots upon interaction failure
            [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' } ],
        ]
    },

    // Configure your Cucumber runner
    cucumberOpts: {
        // see Cucumber configuration options below
    },


    // ... or Jasmine runner
    jasmineOpts: {
        // see Jasmine configuration options below
    },

    // ... or Mocha runner
    mochaOpts: {
        // see Mocha configuration options below
    },

    runner: 'local',

    // Any other WebdriverIO configuration
};
```

</TabItem>
<TabItem value="wdio-conf-javascript" label="JavaScript">

```typescript title="wdio.conf.js"
export const config = {

    // Tell WebdriverIO to use Serenity/JS framework
    framework: '@serenity-js/webdriverio',

    // Serenity/JS configuration
    serenity: {
        // Configure Serenity/JS to use the appropriate adapter for your test runner
        runner: 'cucumber',
        // runner: 'mocha',
        // runner: 'jasmine',

        // Register Serenity/JS reporting services, a.k.a. the "stage crew"
        crew: [
            '@serenity-js/console-reporter',
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
            [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' } ],
        ]
    },

    // Configure your Cucumber runner
    cucumberOpts: {
        // see Cucumber configuration options below
    },


    // ... or Jasmine runner
    jasmineOpts: {
        // see Jasmine configuration options below
    },

    // ... or Mocha runner
    mochaOpts: {
        // see Mocha configuration options below
    },

    runner: 'local',

    // Any other WebdriverIO configuration
};
```

</TabItem>
</Tabs>

Learn more about:
- [Serenity/JS Cucumber configuration options](https://serenity-js.org/api/cucumber-adapter/interface/CucumberConfig/?pk_campaign=wdio8&pk_source=webdriver.io)
- [Serenity/JS Jasmine configuration options](https://serenity-js.org/api/jasmine-adapter/interface/JasmineConfig/?pk_campaign=wdio8&pk_source=webdriver.io)
- [Serenity/JS Mocha configuration options](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/?pk_campaign=wdio8&pk_source=webdriver.io)
- [WebdriverIO configuration file](configurationfile)

### Producing Serenity BDD reports and living documentation

[Serenity BDD reports and living documentation](https://serenity-bdd.github.io/docs/reporting/the_serenity_reports) are generated by [Serenity BDD CLI](https://github.com/serenity-bdd/serenity-core/tree/main/serenity-cli), a Java program downloaded and managed by the [`@serenity-js/serenity-bdd`](https://serenity-js.org/api/serenity-bdd/?pk_campaign=wdio8&pk_source=webdriver.io) module.

To produce Serenity BDD reports, your test suite must:
- download the Serenity BDD CLI, by calling `serenity-bdd update` which caches the CLI `jar` locally
- produce intermediate Serenity BDD `.json` reports, by registering [`SerenityBDDReporter`](https://serenity-js.org/api/serenity-bdd/class/SerenityBDDReporter/?pk_campaign=wdio8&pk_source=webdriver.io) as per the [configuration instructions](#configuring-serenityjs)
- invoke the Serenity BDD CLI when you want to produce the report, by calling `serenity-bdd run`

The pattern used by all the [Serenity/JS Project Templates](https://serenity-js.org/handbook/project-templates/?pk_campaign=wdio8&pk_source=webdriver.io#webdriverio) relies on using:
- a [`postinstall`](https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-operation-order) NPM script to download the Serenity BDD CLI
- [`npm-failsafe`](https://www.npmjs.com/package/npm-failsafe) to run the reporting process even if the test suite itself has failed (which is precisely when you need test reports the most...).
- [`rimraf`](https://www.npmjs.com/package/rimraf) as a convenience method to remove any test reports left over from the previous run

```json title="package.json"
{
  "scripts": {
    "postinstall": "serenity-bdd update",
    "clean": "rimraf target",
    "test": "failsafe clean test:execute test:report",
    "test:execute": "wdio wdio.conf.ts",
    "test:report": "serenity-bdd run"
  }
}
```

To learn more about the `SerenityBDDReporter`, please consult:
- installation instructions in [`@serenity-js/serenity-bdd` documentation](https://serenity-js.org/api/serenity-bdd/?pk_campaign=wdio8&pk_source=webdriver.io),
- configuration examples in [`SerenityBDDReporter` API docs](https://serenity-js.org/api/serenity-bdd/class/SerenityBDDReporter/?pk_campaign=wdio8&pk_source=webdriver.io),
- [Serenity/JS examples on GitHub](https://github.com/serenity-js/serenity-js/tree/main/examples).

### Using Serenity/JS Screenplay Pattern APIs

The [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/?pk_campaign=wdio8&pk_source=webdriver.io) is an innovative, user-centred approach to writing high-quality automated acceptance tests. It steers you towards an effective use of layers of abstraction, helps your test scenarios capture the business vernacular of your domain, and encourages good testing and software engineering habits on your team.

By default, when you register `@serenity-js/webdriverio` as your WebdriverIO `framework`, Serenity/JS configures a default [cast](https://serenity-js.org/api/core/class/Cast/?pk_campaign=wdio8&pk_source=webdriver.io) of [actors](https://serenity-js.org/api/core/class/Actor/?pk_campaign=wdio8&pk_source=webdriver.io), where every actor can:
- [`BrowseTheWebWithWebdriverIO`](https://serenity-js.org/api/webdriverio/class/BrowseTheWebWithWebdriverIO/?pk_campaign=wdio8&pk_source=webdriver.io)
- [`TakeNotes.usingAnEmptyNotepad()`](https://serenity-js.org/api/core/class/TakeNotes/?pk_campaign=wdio8&pk_source=webdriver.io)

This should be enough to help you get started with introducing test scenarios that follow the Screenplay Pattern even to an existing test suite, for example:

```typescript title="specs/example.spec.ts"
import { actorCalled } from '@serenity-js/core'
import { Navigate, Page } from '@serenity-js/web'
import { Ensure, equals } from '@serenity-js/assertions'

describe('My awesome website', () => {
    it('can have test scenarios that follow the Screenplay Pattern', async () => {
        await actorCalled('Alice').attemptsTo(
            Navigate.to(`https://webdriver.io`),
            Ensure.that(
                Page.current().title(),
                equals(`WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO`)
            ),
        )
    })

    it('can have non-Screenplay scenarios too', async () => {
        await browser.url('https://webdriver.io')
        await expect(browser)
            .toHaveTitle('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO')
    })
})
```

To learn more about the Screenplay Pattern, check out:
- [The Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/?pk_campaign=wdio8&pk_source=webdriver.io)
- [Web testing with Serenity/JS](https://serenity-js.org/handbook/web-testing/?pk_campaign=wdio8&pk_source=webdriver.io)
- ["BDD in Action, Second Edition"](https://www.manning.com/books/bdd-in-action-second-edition)
