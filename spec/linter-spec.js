'use babel';

import * as path from 'path';

const travisYml = path.join(__dirname, '.travis.yml');
const badPath = path.join(__dirname, 'files', 'bad.yaml');
const issue2Path = path.join(__dirname, 'files', 'issue-2.yaml');
const issue9Path = path.join(__dirname, 'files', 'issue-9.yaml');

describe('Js-YAML provider for Linter', () => {
  const lint = require('../lib/linter-js-yaml.js').provideLinter().lint;

  beforeEach(() => {
    // This whole beforeEach function is inspired by:
    // https://github.com/AtomLinter/linter-jscs/pull/295/files
    //
    // See also:
    // https://discuss.atom.io/t/activationhooks-break-unit-tests/36028/8
    const activationPromise = atom.packages.activatePackage('linter-js-yaml').then(() =>
      atom.config.set('linter-js-yaml.customTags', ['!yaml', '!include'])
    );

    waitsForPromise(() =>
      atom.packages.activatePackage('language-yaml'));

    waitsForPromise(() =>
      atom.workspace.open(travisYml));

    atom.packages.triggerDeferredActivationHooks();
    waitsForPromise(() => activationPromise);
  });

  it('finds something wrong with bad.yaml', () =>
    waitsForPromise(() =>
      atom.workspace.open(badPath).then((editor) => {
        const messages = lint(editor);
        expect(messages.length).toEqual(1);
        expect(messages[0].type).toEqual('Error');
        expect(messages[0].text).toEqual('end of the stream or a document separator is expected');
        expect(messages[0].filePath).toMatch(/.+bad\.yaml$/);
        expect(messages[0].range).toEqual([[2, 4], [2, 5]]);
      })
    )
  );

  it('finds nothing wrong with issue-2.yaml.', () =>
    waitsForPromise(() =>
      atom.workspace.open(issue2Path).then((editor) => {
        const messages = lint(editor);
        expect(messages.length).toEqual(0);
      })
    )
  );

  it('finds nothing wrong with issue-9.yaml.', () =>
    waitsForPromise(() =>
      atom.workspace.open(issue9Path).then((editor) => {
        const messages = lint(editor);
        expect(messages.length).toEqual(0);
      })
    )
  );
});
