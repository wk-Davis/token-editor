const envvars = {
  REACT_APP_DELIMITER: '_',
  REACT_APP_BASE: 'lineart',
  REACT_APP_FILETYPE: 'png',
  REACT_APP_TOKEN_PATH: 'src/assets/tokens',
  ...process.env,
};

export default envvars;
