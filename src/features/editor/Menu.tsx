import React from 'react';
import { CollapsibleList, List, ListItem, ListItemMeta } from '@rmwc/list';

import '@rmwc/list/styles';

import chevron_right from '../../assets/icons/chevron_right-black-18dp.svg';

const delimiter: string = process.env.REACT_APP_DELIMITER ?? '_';

interface Config {
  [propName: string]: string;
  lineart: string;
}

const GroupHandle: React.FunctionComponent<{ title: string }> = ({
  title,
  ...props
}) => (
  <ListItem {...props}>
    {title}
    <ListItemMeta icon={chevron_right} />
  </ListItem>
);

const Menu: React.FunctionComponent<{}> = () => {
  const config: Config = {
    hair: '888004',
    skin: '#fff',
    clothes_bottom: '#eeefff',
    clothes_top: '#eeefff',
    shoes_body: 'eeefff',
    shoes_tongue: '345ffa',
    lineart: '#000000',
  };
  const keys: string[] = Object.keys(config).sort();

  let prevGroup: string;
  return (
    <List>
      {keys.reduce((comps: Array<React.ReactNode>, name) => {
        const delimiterIndex: number = name.indexOf(delimiter);
        if (delimiterIndex >= 0) {
          const groupName = name.substring(0, delimiterIndex);
          if (groupName === prevGroup) return comps;

          prevGroup = groupName;
          const groupKeys = keys.filter((key) =>
            key.startsWith(`${groupName}_`)
          );
          comps.push(
            <CollapsibleList
              handle={<GroupHandle title={groupName} />}
              key={groupName}
            >
              {groupKeys.map((key) => {
                const subName = key.substring(groupName.length + 1);
                return (
                  <ListItem key={key}>
                    {subName} {config[key]}
                  </ListItem>
                );
              })}
            </CollapsibleList>
          );
        } else {
          comps.push(
            <ListItem key={name}>
              {name} {config[name]}
            </ListItem>
          );
        }
        return comps;
      }, [])}
    </List>
  );
};

export default Menu;
