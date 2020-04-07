import React, { Dispatch } from 'react';
import { CollapsibleList, List, ListItem, ListItemMeta } from '@rmwc/list';

import '@rmwc/list/styles';

import chevron_right from '../../assets/icons/chevron_right-black-18dp.svg';
import envvars from '../../envvars';

const GroupHandle: React.FunctionComponent<{ title: string }> = ({
  title,
  ...props
}) => (
  <ListItem {...props}>
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
  dispatch: Dispatch<any>;
}

const Menu: React.FunctionComponent<Props> = ({ state, dispatch }) => {
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
                  <ListItem key={key}>
                    {subName} {state[key].color}
                  </ListItem>
                );
              })}
            </CollapsibleList>
          );
        } else {
          comps.push(
            <ListItem key={name}>
              {name} {state[name].color}
            </ListItem>
          );
        }
        return comps;
      }, [])}
    </List>
  );
};

export default Menu;
