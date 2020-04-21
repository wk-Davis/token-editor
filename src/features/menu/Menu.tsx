import React from 'react';
import { CollapsibleList, List, ListItem, ListItemMeta } from '@rmwc/list';

import chevron_right from '../../assets/icons/chevron_right-18dp.svg';
import envvars from '../../envvars';
import { ListItemsIndex } from '../editor/Editor';

import './Menu.css';

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
  listItems: ListItemsIndex;
  filenames: string[];
}

const Menu: React.FunctionComponent<Props> = ({ listItems, filenames }) => {
  const keys: string[] = filenames?.sort();

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
                return (
                  <React.Fragment key={key}>{listItems[key]}</React.Fragment>
                );
              })}
            </CollapsibleList>
          );
        } else {
          comps.push(
            <React.Fragment key={name}>{listItems[name]}</React.Fragment>
          );
        }
        return comps;
      }, [])}
    </List>
  );
};

export default Menu;
