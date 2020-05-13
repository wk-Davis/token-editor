

# <a href="https://wk-davis.github.io/token-editor/"><img src="https://raw.githubusercontent.com/wk-Davis/token-editor/master/public/logo192.png" alt="Makeshift Editor Logo" title="Token Editor" align="left" height="40" style="margin-right:5px"/> </a> Token Editor

A custom, character token maker for virtual tabletops. See the [live demo.](https://wk-davis.github.io/token-editor/)

![Usage Example](https://raw.githubusercontent.com/wk-Davis/token-editor/master/public/token_editor.gif)

## Installation

You'll need to have [Node](https://nodejs.org/en/), npm or [yarn](https://yarnpkg.com/) on your machine. All yarn commands can be substituted with npm.
Enter the following into your command line. Then navigate to https://localhost:3000/ to see the app.
```sh
git clone https://github.com/wk-Davis/token-editor.git
cd token-editor
yarn
yarn start
```
Out of the box, it will attempt to open an incognito Chromium browser.
To change this, open the [.env](https://github.com/wk-Davis/token-editor/blob/master/.env) file and modify the `BROWSER` and `BROWSER_ARGS` variables. Or delete both values, and it will default to opening a new Chrome window on `yarn start`.
```sh
...
REACT_APP_TOKEN_PATH=src/assets/tokens
BROWSER=chromium-browser
BROWSER_ARGS=-incognito
```
For more details see [Create React App: Advanced Configuration](https://create-react-app.dev/docs/advanced-configuration)

## License

Distributed under the MIT License. See [LICENSE.md](https://github.com/wk-Davis/token-editor/blob/master/LICENSE.md) for more information.

## Acknowledgements
* [Create React App](https://create-react-app.dev/)
* [Token Artist's Patreon: Dungeon Mapster](https://www.patreon.com/dungeonmapster)