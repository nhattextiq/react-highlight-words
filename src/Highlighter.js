/* @flow */
import { findAll, fillInChunks } from 'highlight-words-core'
import { createElement } from 'react'
import memoizeOne from 'memoize-one'

/**
 * Highlights all occurrences of search terms (searchText) within a string (textToHighlight).
 * This function returns an array of strings and <span>s (wrapping highlighted words).
 */
export default function Highlighter ({
  activeClassName = '',
  activeIndex = -1,
  activeStyle,
  autoEscape,
  caseSensitive = false,
  className,
  findChunks,
  highlightClassName = '',
  highlightStyle = {},
  highlightTag = 'mark',
  sanitize,
  searchWords,
  textToHighlight,
  unhighlightClassName = '',
  unhighlightStyle,
  containerRef,
  enableCombineChunks = true,
  getChunks = false,
  chunksToHighlight = [],
  ...rest
}) {
  const chunks =
  enableCombineChunks ?
    findAll({
      autoEscape,
      caseSensitive,
      findChunks,
      sanitize,
      searchWords,
      textToHighlight
    }) :
    fillInChunks({
      chunksToHighlight,
      totalLength: textToHighlight ? textToHighlight.length : 0
    })
  const HighlightTag = highlightTag
  let highlightIndex = -1
  let highlightClassNames = ''
  let highlightStyles

  const lowercaseProps = object => {
    const mapped = {}
    for (let key in object) {
      mapped[key.toLowerCase()] = object[key]
    }
    return mapped
  }
  const memoizedLowercaseProps = memoizeOne(lowercaseProps)

  const highlightedChunks = chunks.map((chunk, index) => {
    const text = textToHighlight.substr(chunk.start, chunk.end - chunk.start)

    if (chunk.highlight) {
      highlightIndex++

      let highlightClass
      if (typeof highlightClassName === 'object') {
        if (!caseSensitive) {
          highlightClassName = memoizedLowercaseProps(highlightClassName)
          highlightClass = highlightClassName[text.toLowerCase()]
        } else {
          highlightClass = highlightClassName[text]
        }
      } else {
        highlightClass = highlightClassName
      }

      const isActive = highlightIndex === +activeIndex

      highlightClassNames = `${highlightClass} ${isActive ? activeClassName : ''}`
      highlightStyles = isActive === true && activeStyle != null
        ? Object.assign({}, highlightStyle, activeStyle)
        : highlightStyle

      const props = {
        children: text,
        className: highlightClassNames,
        key: index,
        style: highlightStyles
      }

      // Don't attach arbitrary props to DOM elements; this triggers React DEV warnings (https://fb.me/react-unknown-prop)
      // Only pass through the highlightIndex attribute for custom components.
      if (typeof HighlightTag !== 'string') {
        props.highlightIndex = highlightIndex
      }

      return createElement(HighlightTag, props)
    } else {
      return createElement('span', {
        children: text,
        className: unhighlightClassName,
        key: index,
        style: unhighlightStyle
      })
    }
  })

  if (getChunks) return highlightedChunks

  return createElement('span', {
    className,
    ref: containerRef,
    ...rest,
    children: highlightedChunks
  })
}
