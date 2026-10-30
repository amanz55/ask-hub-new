/**
 * The primary button in the Contact page's tiles. Its own module because one
 * tile's button is inside a client component and the other is in the server
 * page, and a server component cannot read a value exported by a client module.
 *
 * `alignSelf` keeps it to its label's width in the tile's column.
 */
export const CONTACT_TILE_BUTTON = {
  alignSelf: 'flex-start',
  marginTop: 18,
  background: '#1F5FBF',
  color: '#fff',
  border: 'none',
  borderRadius: 9,
  padding: '12px 24px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
} as const;
