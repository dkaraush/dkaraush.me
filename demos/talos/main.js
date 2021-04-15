const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function getQuery(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
function getPathWithQuery(name, value, url = window.location.href) {
  const questionmarkIndex = url.indexOf('?');
  if (questionmarkIndex < 0 || questionmarkIndex === url.length - 1)
    return url + (questionmarkIndex === url.length - 1 ? '' : '?') + encodeURIComponent(name) + '=' + encodeURIComponent(value);
  return url + '&' + encodeURIComponent(name) + '=' + encodeURIComponent(value);
}

let LNG = getQuery('lang') || '';
let TERMINAL, CAPSULENAMES, DATA;
const t = (field, params) => {
  let str = (TERMINAL[field] || '');
  for (const paramkey in (params || {}))
    str = str.replace(new RegExp('\\{\\{' + paramkey + '\\}\\}', 'g'), params[paramkey]);
  return str;
}
  

const pageLoading = document.querySelector('#page-loading');
const pageTerminal = document.querySelector('#page-terminal');
const variants = document.querySelector('#variants');

const showVariants = (menus, preferable) => {
  variants.innerHTML = '';
  variants.className = menus.length > 3 ? 'two-columns' : '';

  return new Promise(async (resolve) => {
    let selected = false;

    const divs = [];
    for (const menu of menus) {
      const div = document.createElement('div');
      div.innerHTML = menu;
      div.className = 'hidden'
      if (preferable === menu)
        div.className = 'hidden preferable';
      div.addEventListener('click', () => {
        if (selected)
          return;
        selected = true;
        sound('TerminalTypingReturnKey')
        resolve(menu);
        variants.innerHTML = '';
      });
      variants.appendChild(div);
      divs.push(div);
    }

    sound('TerminalTypingComputer');
    for (const div of divs) {
      await wait(20);
      if (div.className.indexOf('preferable') >= 0)
        div.className = 'preferable';
      else
        div.className = '';
    }
    soundStop('TerminalTypingComputer');
  });
}

/* === PAGE LOADING === */
const loadingState = pageLoading.querySelector('pre#state');

// Eye animation
const eyePre = pageLoading.querySelector('pre#eye');
const eyeKeyframes = [0,1,10,1,2,3,10,3,4,5,10,5,6,7,10,7,8,9,10,9,8,7,10,7,6,5,10,5,4,3,10,3,2,1,10,1];
const stopEyeAnimation = (() => {
  let active = true, i = 0;

  (function eyeAnimationProcess() {
    if (!active)
      return;

    eyePre.innerHTML = eye[eyeKeyframes[i % eyeKeyframes.length]];
    
    if (typeof window.beep === 'function' && Math.random() > 0.6)
      window.beep(~~(Math.random()*14+1));

    i++;
    setTimeout(eyeAnimationProcess, 300);
  })();

  return () => active = false;
})();
// page management
pageLoading.style.display = 'block';
loadingState.innerHTML = 'Loading...';
const closeLoading = () => {
  pageLoading.style.display = 'none';
  stopEyeAnimation();
  window.beep = null;
  pageTerminal.style.display = 'block';
}
const loaded1 = async () => {

  if (!LNG) {
    loadingState.innerHTML = 'Choose language...';
    const p = {
      rus: ['ru', 'ua'],
      por: ['por', 'pt'],
      plk: ['pol', 'pl', 'plk'],
      kor: ['kor', 'ko'],
      jpn: ['jpn', 'ja'],
      itl: ['ita', 'it', 'itl'],
      hrv: ['hrv', 'hr'],
      fra: ['fra', 'fr', 'fre'],
      esp: ['spa', 'es', 'esp'],
      enu: ['en'],
      deu: ['de', 'deu'],
      chs: ['chi', 'zho', 'zh'],
      cht: ['chi', 'zho', 'zh']
    };  
    const nLng = (navigator.language || '').split('-')[0].toLowerCase()
    const preferable = (Object.entries(p).find(([code, lngs]) => lngs.includes(nLng)) || [])[0];

    const language = await showVariants(Object.values(languages), languages[preferable]);
    LNG = Object.entries(languages).find(([code, value]) => value === language)[0];

    window.history.pushState(null, document.title, getPathWithQuery('lang', LNG));
  }

  loadingState.innerHTML = 'Loading...';
  TERMINAL = await fetch('data/' + LNG + '/terminal.json').then(r => r.json());
  CAPSULENAMES = await new Promise(resolve => 
    fetch('capsules/' + LNG + '/names.json')
      .catch(() => resolve(null))
      .then(r => r.json())
      .catch(() => resolve(null))
      .then(json => resolve(json))
  );
  DATA = await fetch('data/' + LNG + '/data.json').then(r => r.json());

  loadingState.innerHTML = t('press-any-key');

  let entered = false;
  const onEnter = () => {
    if (entered)
      return;
    entered = true;
    sound('TerminalTypingReturnKey')

    closeLoading();
    startTerminal();
  }

  window.addEventListener('keypress', e => onEnter());
  window.addEventListener('touchend', () => onEnter());
  window.addEventListener('click', () => onEnter());
}

// loading
const LOADING = {
  sounds: false,
  languages: false
};
const updateLoading = () => {
  if (Object.values(LOADING).every(b => b)) {
    loaded1();
  }
}

// sounds
const soundNames = ["TerminalSystemBoot", "TerminalPowerOn", "TerminalTypingComputer", "TerminalTypingUser", "TerminalDocumentOpen", "TerminalDocumentClose", "TerminalTypingReturnKey", "TerminalCursorBlinking", "Beep1", "Beep2", "Beep3", "Beep4", "Beep5", "Beep6", "Beep7", "Beep8", "Beep9", "Beep10", "Beep11", "Beep12", "Beep13", "Beep14", "Beep15"];
const sounds = {};
let loadedSounds = 0;
for (const soundName of soundNames) {
  sounds[soundName] = document.createElement("audio");
  sounds[soundName].src = "sounds/"+soundName+".mp3";
  sounds[soundName].volume = 0.5;	
  if (soundName == "TerminalTypingComputer" || soundName == "TerminalTypingUser" || soundName == 'TerminalCursorBlinking')
    sounds[soundName].loop = true;
  if (soundName.substring(0, 4) == "Beep")
    sounds[soundName].volume = 0.1;
  if (soundName == "TerminalCursorBlinking")
    sounds[soundName].volume = 0.3;
  sounds[soundName].onloadeddata = function () {
    loadedSounds++;
    if (loadedSounds == soundNames.length) {
      LOADING.sounds = true;
      updateLoading();
    }
  }		
}
const sound = name => {
  if (sounds && sounds[name])
    sounds[name].play();
}
const soundStop = name => {
  if (sounds && sounds[name])
    sounds[name].pause();
}

window.beep = n => {
  if (sound)
    sound(`Beep${n % 16}`);
}

let languages = {};
fetch('data/languages.json')
  .then(r => r.json())
  .then(l => {
    languages = l;
    LOADING.languages = true;
    updateLoading();
  })

/* === PAGE TERMINAL === */
const terminal = pageTerminal.querySelector('#terminal');
const write = str => {
  const atBottom = pageTerminal.scrollTop + pageTerminal.clientHeight >= pageTerminal.scrollHeight - 2;
  terminal.innerHTML += str;
  if (atBottom)
    pageTerminal.scrollTo(0, pageTerminal.scrollHeight);
}
const rewrite = str => {
  const atBottom = pageTerminal.scrollTop + pageTerminal.clientHeight >= pageTerminal.scrollHeight - 2;
  const lastNewLineIndex = terminal.innerHTML.lastIndexOf('\n');
  if (lastNewLineIndex < 0)
    terminal.innerHTML = str;
  else {
    terminal.innerHTML = terminal.innerHTML.substring(0, lastNewLineIndex + 1) + str;
  }
  if (atBottom)
    pageTerminal.scrollTo(0, pageTerminal.scrollHeight);
}
const type = async (str, d = 0, withSound = true) => {
  if (withSound)
    sound('TerminalTypingComputer');
  for (const s of (String(str) || [])) {
    const waitMs = 8 + 15 * Math.random() + d;
    if (s !== ' ' && s !== '\n' && waitMs > 0)
      await wait(waitMs);
    write(s);
  }
  if (withSound)
    soundStop('TerminalTypingComputer');
}
const userType = async (str, d = 45) => {
  sound('TerminalTypingUser');
  await type(str, d, false);
  soundStop('TerminalTypingUser');
  sound('TerminalTypingReturnKey');
}

const F = sec => 
  String(~~(sec / 60)).padStart(2, '0') + ':' +
  String(~~(sec % 60)).padStart(2, '0');
const capsuleRun = async i => {
  const audio = document.createElement('audio');
  audio.src = 'capsules/' + LNG + '/' + i + '.mp3';
  audio.volume = 0.5;

  write(t('loading'));
  await new Promise(resolve => audio.onloadeddata = () => resolve());

  audio.play();

  const interval = setInterval(() => {
    const p = audio.currentTime / audio.duration

    rewrite('[' + F(audio.currentTime) + '] [' + 
      '='.repeat(Math.floor(30 * p)) +
      '-'.repeat(Math.ceil(30 * (1 - p))) +
      '] [' + F(audio.duration) + ']'
    )
  }, 100);

  const СMD_STOP = t('cmd-stop');
  await Promise.race([
    new Promise(resolve => audio.onended = () => resolve()),
    showVariants([ СMD_STOP ])
  ]);
  audio.pause();
  variants.innerHTML = '';

  clearInterval(interval);
}

const documentPage = document.querySelector('#document');
const documentPagePre = documentPage.querySelector('pre');
const documentRun = async text => {
  sound('TerminalDocumentOpen');

  documentPagePre.innerText = text;
  documentPage.className = '';

  await showVariants([ t('cmd-close') ]);
  sound('TerminalDocumentClose');

  documentPage.className = 'hidden';
  await wait(150);
}

const prompt = async (variants) => {
  sound('TerminalCursorBlinking');
  await write('[admin@local]# <span class="blink"> ');
  const variant = await showVariants(variants);
  soundStop('TerminalCursorBlinking');

  await rewrite('[admin@local]# ');
  await userType(variant + '\n');
  return variant;
}

const startTerminal = async () => {
  sound('TerminalPowerOn');

  await type(t('boot-1'));
  await type('...', 80, false);
  await type(t('boot-2'));
  await write('\n');

  await type(t('boot-3'));
  await type('...', 80, false);
  await type(t('boot-4'), -2);
  await write('\n');

  await type(t('boot-5'));
  await type('......', 80, false);
  sound('TerminalSystemBoot');
  await write(t('boot-6'));
  await write('\n\n');
  await write(t('boot-7'));

  await write('\n');
  while (true) {
    const CMD_TERMINALS = t('cmd-terminals'),
          CMD_CAPSULES = t('cmd-capsules'),
          CMD_CREDITS = t('cmd-credits'),
          CMD_BACK = t('cmd-back');
    const cmd = await prompt([ CMD_TERMINALS, CMD_CAPSULES, CMD_CREDITS ]);

    if (cmd === CMD_TERMINALS) {
      const terminals = Object.entries(DATA);

      const CMD_TERMINALS = [];
      for (const [ name ] of terminals) {
        const CMD_TERMINAL = t('cmd-terminal', { name })
        CMD_TERMINALS.push(CMD_TERMINAL);
        await type(CMD_TERMINAL + '\n', -7);
      }

      while (true) {
        const CMD_TERMINAL = await prompt([...CMD_TERMINALS, CMD_BACK]);
        if (CMD_TERMINAL === CMD_BACK)
          break;

        const terminal = terminals.find(([ name ]) => t('cmd-terminal', { name }) == CMD_TERMINAL)[1];

        const maxAuthorName = terminal.reduce((m, { author }) => {
          const v = (author || '').length;
          return m < v ? v : m;
        }, 0);
        const maxDateName =   terminal.reduce((m, { date }) => {
          const v = (date || '').length;
          return m < v ? v : m;
        }, 0);
        const CMD_FILES = [];
        for (const file of terminal) {
          CMD_FILES.push(file.name);

          await type(
            String(file.author || '').padEnd(maxAuthorName, ' ') +
            ' ' +
            String(file.date || '').padEnd(maxDateName, ' ') + 
            '  ',
            -12
          );
          await write(
            '<span class="yellow">' + file.name + '</span>\n'
          );
        }

        while (true) {
          const CMD_FILE = await prompt([...CMD_FILES, CMD_BACK]);
          if (CMD_FILE == CMD_BACK)
            break;
          
          const file = terminal.find(f => f.name == CMD_FILE);

          await documentRun(file.text); 
        }
      }
    } else if (cmd === CMD_CAPSULES) {
      const CMD_CAPSULES = [];
      for (let id = 1; id <= 22; ++id) {
        const capsuleName = (CAPSULENAMES || [])[id - 1];
        const CMD_CAPSULE = (
          capsuleName ?
            t('cmd-capsule-with-name', { id, name: capsuleName }) :
            t('cmd-capsule', { id })
        );
        CMD_CAPSULES.push(CMD_CAPSULE);

        await type(CMD_CAPSULE + '\n', -12);
      }

      while (true) {
        const capsule = await prompt([...CMD_CAPSULES, CMD_BACK]);
        if (capsule === CMD_BACK)
          break;

        const capsuleId = CMD_CAPSULES.findIndex(cmd => capsule === cmd) + 1;

        await capsuleRun(capsuleId);
        await write('\n\n');
      }
    } else if (cmd === CMD_CREDITS) {
      await type('Development: ');
      await write('<a href="https://dkaraush.me/">Dmitriy Karaush</a>\n');
      await type('Translation (Polski): ');
      await write('<a href="https://t.me/Allrightthenkeepyoursecrets">Pavel</a>\n\n');
    }
  }
}
