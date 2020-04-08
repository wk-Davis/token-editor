import React from 'react';
import { CollapsibleList, List, ListItem, ListItemMeta } from '@rmwc/list';

import './Menu.css';
import '@rmwc/list/styles';

import InputChip from '../inputChips/InputChip';
import chevron_right from '../../assets/icons/chevron_right-black-18dp.svg';
import envvars from '../../envvars';

const GroupHandle: React.FunctionComponent<{ title: string }> = ({
  title,
  ...props
}) => (
  <ListItem ripple={false} {...props}>
    {title}
    <ListItemMeta icon={chevron_right} />
  </ListItem>
);

interface Props {
  state: {
    [name: string]: {
      color: string;
      src: string;
    };
  };
}

const Menu: React.FunctionComponent<Props> = ({ state }) => {
  const keys: string[] = Object.keys(state).sort();

  let prevGroup: string;
  return (
    <List>
      {keys.reduce((comps: Array<React.ReactNode>, name) => {
        const delimiterIndex: number = name.indexOf(
          envvars.REACT_APP_DELIMITER
        );
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
                  <ListItem ripple={false} key={key}>
                    {subName}
                    <ListItemMeta>
                      <InputChip name={key} stateColor={state[key].color} />
                    </ListItemMeta>
                  </ListItem>
                );
              })}
            </CollapsibleList>
          );
        } else {
          comps.push(
            <ListItem ripple={false} key={name}>
              {name}
              <ListItemMeta>
                <InputChip name={name} stateColor={state[name].color} />
              </ListItemMeta>
            </ListItem>
          );
        }
        return comps;
      }, [])}
    </List>
  );
};

export default Menu;
