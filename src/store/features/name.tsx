import { createSlice } from '@reduxjs/toolkit'

export const nameSlice = createSlice({
  name: 'name',
  initialState: {
    value: '',
  },
  reducers: {
    changeValue:(state,action)=>{
        state.value=action.payload
    }
  },
})

export const { changeValue } = nameSlice.actions

export default nameSlice.reducer