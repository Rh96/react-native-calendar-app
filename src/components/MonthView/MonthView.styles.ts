import { StyleSheet } from 'react-native';
import { CALENDAR_CELL_SIZE } from '../../constants/dimensions';

export const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: CALENDAR_CELL_SIZE,
    height: CALENDAR_CELL_SIZE,
  },
});



