# Logos

Drop a logo image here and it appears on the Experience page. The file name
(without extension) is how `src/data/portfolio.ts` refers to it, e.g.
`xsolla.png` is `logos.xsolla`. Any of .svg, .png, .webp, .jpg works; square-ish
on a transparent or white background looks best.

| File name      | Organization                          |
|----------------|---------------------------------------|
| xsolla         | Xsolla                                |
| wics           | McGill Women in Computer Science      |
| desautels      | McGill Desautels Faculty of Management|
| mcgill         | McGill University                     |
| brampton       | City of Brampton                      |
| books-galore   | Books Galore (freelance client)       |
| shea-tree      | Save the Shea Tree (freelance client) |

For a different name, set `logo: logos["your-file-name"]` on the role, or
import the image directly: `import logo from "../assets/somewhere/logo.png"`
and `logo: logo`.
