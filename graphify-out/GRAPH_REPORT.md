# Graph Report - trame_newsletter-main  (2026-11-27)

## Corpus Check
- 3 files · ~547,749 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 181 nodes · 344 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `push()` - 25 edges
2. `constructor()` - 20 edges
3. `prepForXml()` - 17 edges
4. `render()` - 15 edges
5. `add()` - 11 edges
6. `_objectSpread2()` - 10 edges
7. `addRelationship()` - 10 edges
8. `$()` - 9 edges
9. `get()` - 9 edges
10. `addSection()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `buildWordDocument()` --calls--> `$()`  [INFERRED]
  export-docx.js → app.js
- `buildWordDocument()` --calls--> `render()`  [INFERRED]
  export-docx.js → app.js

## Import Cycles
- None detected.

## Communities (12 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (35): applyLineHeight(), area, backgroundChoices, blocks(), clean(), editors, extraInsets, ids (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (38): add(), addChildElement(), addComments(), addCommentsExtended(), addCommentsIds(), addCustomProperty(), addDefaultRelationships(), addFooter() (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.50
Nodes (4): getCellWidth(), getSectionPropertiesFor(), resolveAvailableWidth(), textWidthIn()

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (10): addImage(), _defineProperty(), _objectSpread2(), ownKeys(), patch(), takePath(), toPrimitive(), toPropertyKey() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (16): _asyncToGenerator(), buildCachedContentParagraphChild(), buildCachedContentRun(), compile(), format(), getMediaData(), _objectWithoutProperties(), _objectWithoutPropertiesLoose() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.50
Nodes (4): _addListener(), checkListener(), _getMaxListeners(), ProcessEmitWarning()

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (3): addCellToColumnIndex(), addCellToIndex(), columnIndexToRootIndex()

### Community 9 - "Community 9"
Cohesion: 1.00
Nodes (3): addErrorHandlerIfEventEmitter(), eventTargetAgnosticAddListener(), once()

### Community 10 - "Community 10"
Cohesion: 0.67
Nodes (3): arrayClone(), _listeners(), unwrapListeners()

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (3): deflateSync(), strToU8(), zipSync()

## Knowledge Gaps
- **13 isolated node(s):** `ids`, `editors`, `lineHeights`, `extraInsets`, `insetKeys` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `push()` connect `Community 2` to `Community 1`, `Community 11`, `Community 7`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `constructor()` connect `Community 2` to `Community 1`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `ids`, `editors`, `lineHeights` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09446693657219973 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.03571428571428571 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10953058321479374 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._