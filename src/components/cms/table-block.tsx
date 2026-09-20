import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import { asRecordArray, asString, asStringArray } from "./helpers";

/**
 * A plain data table: column headers plus rows of cells, both from the CMS.
 * On phones every row becomes a small card with the column name in front of
 * each value, so nothing needs horizontal scrolling.
 */
export function TableBlock({ component }: CmsComponentRenderProps<StarterRenderContext>) {
  const caption = asString(component.fields.caption).trim();
  const note = asString(component.fields.note).trim();

  const columns = asRecordArray(component.fields.columns)
    .map((entry) => asString(entry.label).trim())
    .filter((label) => label.length > 0);

  const rows = asRecordArray(component.fields.rows)
    .map((entry) => asStringArray(entry.cells).map((cell) => cell.trim()))
    .filter((cells) => cells.some((cell) => cell.length > 0));

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-14">
      <div className="max-w-3xl">
        {caption ? (
          <h2 className="mb-4 text-xl font-semibold text-white sm:text-2xl">{caption}</h2>
        ) : null}

        <table className="data-table w-full border-collapse text-sm">
          {columns.length > 0 ? (
            <thead>
              <tr>
                {columns.map((label) => (
                  <th
                    key={label}
                    scope="col"
                    className="border-b border-white/15 pb-3 pr-4 text-left font-medium text-white/50"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}

          <tbody>
            {rows.map((cells, rowIndex) => (
              <tr key={rowIndex}>
                {/* Short rows keep their shape: missing cells render empty. */}
                {(columns.length > 0 ? columns : cells).map((_, cellIndex) => (
                  <td
                    key={cellIndex}
                    data-label={columns[cellIndex] ?? ""}
                    className="border-t border-white/[0.06] py-3.5 pr-4 align-top text-white/70 first:font-medium first:text-white"
                  >
                    {cells[cellIndex] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {note ? <p className="mt-4 text-[0.8125rem] text-white/45">{note}</p> : null}
      </div>
    </section>
  );
}
