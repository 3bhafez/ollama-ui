import { BiSearch } from 'react-icons/bi'

const SearchBar = ({ onSearch, placeholder = "Search models" }) => {
  const handleSearch = (e) => {
    onSearch(e.target.value)
  }
  
  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
        <BiSearch className="h-4 w-4" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-lg  bg-gray-100 pl-10 pr-8 py-2.5 text-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
        onChange={handleSearch}
        aria-label="Search models"
      />
    </div>
  )
}

export default SearchBar