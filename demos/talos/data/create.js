RegExp.escape = function(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
};

const fs = require('fs');

const langs = ["chs","cht","deu","enu","esp","fra","hrv","itl","jpn","kor","plk","por","rus"];

const getText = path => fs.readFileSync(path).toString();
const getJSON = path => JSON.parse(getText(path));

const rT = (translation, key) => 
  translation.match(new RegExp('' + RegExp.escape(key) + '=(.+)'))[1]
    .replace(/\&lt\;/g, '<')
    .replace(/\&gt\;/g, '>')

const base = getJSON('./terminalbase.json');
for (const lang of langs) {
  const translation = getText('./' + lang + '/translation_All.txt');
  const terminals = {};
  for (const terminalAlias in base) {
    const terminalName = rT(translation, terminalAlias);
    terminals[terminalName] = [];

    for (const f of base[terminalAlias]) {
      if (!f)
        continue;
      const { tag, date, folder } = f;
      if (!tag) {
        continue;
      }
      const n = tag.split('.');
      const T = n.slice(0, n.length - 1).join('.')
      
      const name = rT(translation, T + '.Name');
      let text = null;
      try {
        text = rT(translation, T + '.Text');
        text = text.replace(/\\n/g, '\n');
        text = text.replace(/^\n+/g, '');
      } catch (e) {}

      terminals[terminalName].push({ name, text, date, author: folder });
    }
  }

  fs.writeFileSync('./' + lang + '/data.json', JSON.stringify(terminals));


  const terminal = getJSON('./' + lang + '/terminal.json');
  const welcome = 
    rT(translation, 'TermDlg.CLI_Global.Ln0028.0.text.LoadingLibraryOSDoneMounting')
      .replace(/\%w\d|\%s\d/g, '')
      .replace(/\\n/g, '\n')
      .split(/\.{6}|\.{3}|\n/g)
      .filter(s => !!s);
  welcome.push(
    rT(translation, 'TermDlg.ElevatorFloors.Ln0014.0.text.LibraryArchiveSessionReady')
      .replace(/\\n/g, '')
  )
  for (let i = 0; i < welcome.length; ++i)
    terminal['boot-' + (i + 1)] = welcome[i];

  terminal['loading'] = rT(translation, 'Menu.Loading');
  terminal['press-any-key'] = rT(translation, 'Menu.PressAnyKey');
  terminal['cmd-stop'] = rT(translation, 'TimeSwitch.StopNoCmd');
  terminal['cmd-back'] = rT(translation, 'Menu.Back');
  terminal['cmd-capsule'] = rT(translation, 'TermDlg.Common.AudioLogX').replace('%1', '{{id}}')
  terminal['cmd-capsule-with-name'] = rT(translation, 'TermDlg.Common.AudioLogX').replace('%1', '{{id}} "{{name}}"')
  terminal['cmd-terminal'] = rT(translation, 'TermDlg.JournalHeader.Terminal') + " {{name}}";
  terminal['cmd-close'] = rT(translation, 'ComputerTerminal.CloseDocument');

  // terminal['cmd-terminals'] = "Show terminals";
  // terminal['cmd-capsules'] = "Listen to capsules";

  terminal['cmd-credits'] = rT(translation, 'Episode.Name.Credits');

  fs.writeFileSync('./' + lang + '/terminal.json', JSON.stringify(terminal, null, '\t'));
}