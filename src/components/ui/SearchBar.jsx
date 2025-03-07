import { BiSearch } from 'react-icons/bi'

const SearchBar = () => {
    const handleSearch = (e) => {

    }
  
    return (
      <div className="relative w-85">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <BiSearch className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search models"
          className="w-full rounded-md border border-gray-200 bg-gray-100 pl-10 pr-8 py-2 text-sm focus:border-gray-300 focus:outline-none"
          onChange={handleSearch}
          aria-label="Search models"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          /
        </div>
      </div>
    )
  }
  
  export default SearchBar