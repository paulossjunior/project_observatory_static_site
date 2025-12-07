# Implementation Plan

- [x] 1. Extend projectsData utility with single-person aggregation
  - Add `aggregateProjectsForPerson(personData: PersonData)` function to `src/utils/projectsData.ts`
  - Implement logic to process only the provided person's project arrays
  - Use same year parsing and counting logic as existing `aggregateProjectsByYear()`
  - Return ProjectCount[] array sorted by year
  - Handle edge case where person has no projects (return empty array)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Modify ProjectsBarChart to accept pre-aggregated data
  - Add optional `aggregatedData?: ProjectCount[]` prop to ProjectsBarChart component
  - Update component logic to use provided aggregatedData if available
  - Otherwise, call `aggregateProjectsByYear()` as before (for home page)
  - Ensure backward compatibility with existing home page usage
  - _Requirements: 4.1, 4.3, 4.4_

- [x] 3. Create PersonProjectsChart wrapper component
  - Create `src/components/PersonProjectsChart.astro` file
  - Define props interface accepting PersonData and personName
  - Call `aggregateProjectsForPerson()` to get researcher-specific data
  - Render ProjectsBarChart with aggregated data and researcher-specific title
  - Add styled message for researchers with no projects
  - Set appropriate height (350px) for profile page context
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.3, 4.2_

- [x] 4. Integrate chart into person profile page
  - Import PersonProjectsChart component in `src/pages/person/[id].astro`
  - Add component after PersonHeader section
  - Pass personData and person name as props
  - Verify chart appears before other profile sections
  - Test with multiple researcher profiles
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.4_

- [ ]* 5. Test across different researcher profiles
  - Test with researchers who have many projects
  - Test with researchers who have few projects
  - Test with researchers who have no projects
  - Verify responsive behavior on mobile devices
  - Check that only individual researcher's data is shown
  - _Requirements: 1.4, 1.5, 2.5, 3.4, 3.5_
