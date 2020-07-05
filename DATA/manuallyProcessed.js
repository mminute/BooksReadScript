const constants = require('../constants.js');

const graphicNovelTag = [constants.graphicNovel];

const manuallyProcessed = [
  {
    title: "B.P.R.D. 3: Plauge of Frogs",
    author: 'Mignola, Mike',
    date: new Date('February 16, 2012'),
    tags: graphicNovelTag,
    review: 0,
    notes: null,
  },
  {
    title: "B.P.R.D. 2: The Soul of Venice and and Other Stories",
    author: 'Mignola, Mike',
    date: new Date('February 14, 2012'),
    tags: graphicNovelTag,
    review: 0,
    notes: null,
  },
  {
    title: "B.P.R.D. 1: Hollow Earth and Other Stories",
    author: 'Mignola, Mike',
    date: new Date('February 10, 2012'),
    tags: graphicNovelTag,
    review: 0,
    notes: null
  },
  {
    title: "The Portrait of Mr W.H.",
    author: 'Wilde, Oscar',
    date: new Date('June 28, 2008'),
    tags: [constants.fiction],
    review: 0,
    notes: null
  },
  {
    title: "Star Tek: Starfleet Corp of Engineers- Book One: Have Tech. Will Travel",
    author: 'DeCandido, Keith R.A., Kevin Dilmore, Christie Golden, Dean Wesley Smith, and Dayton Ward',
    date: new Date('May 14, 2020'),
    tags: [constants.sciFi],
    review: 0,
    notes: null
  },
  {
    title: "L. Ron Hubbard Presents: The Best of Writers of the Future",
    author: 'Edited by Budrys, Algis',
    date: new Date('February 27, 2013'),
    tags: [constants.sciFi],
    review: 0,
    notes: null
  },
  {
    title: "Last Bridge To Victory",
    author: 'Cortesi, Lawrence',
    date: new Date('December 14, 2014'),
    tags: [constants.history, constants.military],
    review: 0,
    notes: 'Forgetable WWII novel'
  },
  {
    title: "Cloud Atlas",
    author: 'Mitchell, David',
    date: new Date('January 31, 2015'),
    tags: [constants.sciFi],
    review: 0,
    notes: 'Did not understand this book',
  },
  {
    title: "The Empire of Isher",
    author: 'Van Vogt, A.E.',
    date: new Date('November 3, 2017'),
    tags: [constants.sciFi],
    review: 0,
    notes: null,
  },
  {
    title: "White Noise",
    author: 'DeLillo, Don',
    date: new Date('June 13, 2014'),
    tags: [constants.fiction, constants.classics],
    review: 0,
    notes: 'Weird book. I did not get it',
  },
  {
    title: "American Psycho",
    author: 'Ellis, Bret Easton',
    date: new Date('March 20, 2014'),
    tags: [constants.fiction, constants.classics, constants.horror],
    review: 0,
    notes: 'Weird book. I did not get it',
  },
  {
    title: "The Crying of Lot 49",
    author: 'Pynchon, Thomas',
    date: new Date('February 3,2014'),
    tags: [constants.fiction, constants.classics],
    review: 0,
    notes: 'Did not understand this book',
  },
];

module.exports = manuallyProcessed;
