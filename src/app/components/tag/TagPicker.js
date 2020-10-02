import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import styled from 'styled-components';
import { black54, units, opaqueBlack02, opaqueBlack05, StyledCheckbox } from '../../styles/js/shared';

const StyledNotFound = styled.div`
  color: ${black54};
  padding-top: ${units(14)};
  display: flex;
  justify-content: center;
`;

const StyledTagPickerArea = styled.div`
  padding: ${units(2)};
  height: ${units(32)};
  overflow-y: auto;
  border: 1px solid ${opaqueBlack05};
  background-color: ${opaqueBlack02};
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  margin-${props => props.theme.dir === 'rtl' ? 'right' : 'left'}: -14px !important;
  margin-${props => props.theme.dir === 'rtl' ? 'left' : 'right'}: 16px !important;
`;

class TagPicker extends React.PureComponent {
  renderNotFound(totalTagsCount) {
    if (totalTagsCount === 0) {
      return (
        <StyledNotFound>
          <FormattedMessage
            id="tagPicker.emptyTags"
            defaultMessage="There are currently no tags for this workspace."
          />
        </StyledNotFound>
      );
    }

    return (
      <StyledNotFound>
        <FormattedMessage
          id="tagPicker.tagNotFound"
          defaultMessage="Tag #{tag} not found."
          values={{ tag: this.props.value }}
        />
      </StyledNotFound>
    );
  }

  render() {
    const {
      media,
      value,
      selectedTags,
      onClick,
    } = this.props;

    const compareString = (tag, val) => {
      if (!tag) {
        return false;
      }
      return tag.toLowerCase().includes(val.toLowerCase());
    };

    const tag_texts = media.team.tag_texts || { edges: [] };
    const shown_tag_texts = value ?
      tag_texts.edges.filter(t => compareString(t.node.text, value)) :
      tag_texts.edges;

    const shownTagsCount = shown_tag_texts.length;
    const totalTagsCount = tag_texts.edges.length;

    return (
      <StyledTagPickerArea>
        { shownTagsCount === 0 ?
          this.renderNotFound(totalTagsCount) :
          <FormGroup>
            {
              shown_tag_texts.map((tag, index) => (
                <StyledFormControlLabel
                  key={`team-suggested-tag-${index.toString()}`}
                  control={
                    <StyledCheckbox
                      checked={selectedTags.includes(tag.node.text)}
                      onChange={onClick}
                      id={tag.node.text}
                    />
                  }
                  label={tag.node.text}
                />
              ))
            }
          </FormGroup>
        }
      </StyledTagPickerArea>
    );
  }
}

TagPicker.propTypes = {
  value: PropTypes.string,
  media: PropTypes.object.isRequired,
};

TagPicker.defaultProps = {
  value: null,
};

export default TagPicker;
