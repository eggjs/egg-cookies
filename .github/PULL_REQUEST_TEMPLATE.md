<!--
Thank you for your pull request. Please review below requirements.
Bug fixes and new features should include tests and possibly benchmarks.
Contributors guide: https://github.com/eggjs/egg/blob/master/CONTRIBUTING.md

感谢您贡献代码。请确认下列 checklist 的完成情况。
Bug 修复和新功能必须包含测试，必要时请附上性能测试。
Contributors guide: https://github.com/eggjs/egg/blob/master/CONTRIBUTING.md
-->

##### Checklist
<!-- Remove items that do not apply. For completed items, change [ ] to [x]. -->

- [ ] `npm test` passes
- [ ] tests and/or benchmarks are included
- [ ] documentation is changed or added
- [ ] commit message follows commit guidelines

##### Affected core subsystem(s)
<!-- Provide affected core subsystem(s). -->
compatible to the old version.

##### Description of change
<!-- Provide a description of the change below this comment. -->
resolve "(node:12008) [DEP0106] DeprecationWarning: crypto.createCipher is deprecated" warning when the node version gt than 11.0.0;
update the keygrip support using object for iv params and keeping compatible with the old version
enhance the keys checking：
1、each of Keys is either object or string
2、if the Key is object,key property must be privided with a string of 32 length
3、if the Key is object,iv property must be privided with a string of 16 length
eg:
const key = new Keygrip([
    'myoldversionkeys2',
    'myoldversionkeys1',
    { 
        key: '12345678900987654321123456789009', 
        iv: '1234567890098765' 
    }]);
