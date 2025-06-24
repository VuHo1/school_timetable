import { useAuth } from '../context/AuthContext';

/**
 * Custom hook để kiểm tra abilities của user
 */
export function useAbilities() {
  const { abilities } = useAuth();

  /**
   * Kiểm tra xem user có ability cụ thể không
   * @param {string} ability - Tên ability cần kiểm tra
   * @returns {boolean} - true nếu có quyền, false nếu không
   */
  const hasAbility = (ability) => {
    return abilities && abilities.includes(ability);
  };

  /**
   * Kiểm tra xem user có ít nhất một trong các abilities không
   * @param {string[]} abilitiesList - Danh sách abilities cần kiểm tra
   * @returns {boolean} - true nếu có ít nhất một quyền
   */
  const hasAnyAbility = (abilitiesList) => {
    if (!abilities || !Array.isArray(abilitiesList)) return false;
    return abilitiesList.some(ability => abilities.includes(ability));
  };

  /**
   * Kiểm tra xem user có tất cả abilities trong danh sách không
   * @param {string[]} abilitiesList - Danh sách abilities cần kiểm tra
   * @returns {boolean} - true nếu có tất cả quyền
   */
  const hasAllAbilities = (abilitiesList) => {
    if (!abilities || !Array.isArray(abilitiesList)) return false;
    return abilitiesList.every(ability => abilities.includes(ability));
  };

  /**
   * Lấy danh sách abilities của user
   * @returns {string[]} - Danh sách abilities
   */
  const getUserAbilities = () => {
    return abilities || [];
  };

  /**
   * Kiểm tra xem user có quyền admin không
   * @returns {boolean} - true nếu có quyền admin
   */
  const isAdmin = () => {
    return hasAbility('Quản lí tài khoản') || hasAbility('Cấu hình hệ thống');
  };

  /**
   * Kiểm tra xem user có quyền staff không  
   * @returns {boolean} - true nếu có quyền staff
   */
  const isStaff = () => {
    return hasAbility('Quản lí lớp học') || hasAbility('Thời khóa biểu');
  };

  return {
    abilities,
    hasAbility,
    hasAnyAbility,
    hasAllAbilities,
    getUserAbilities,
    isAdmin,
    isStaff
  };
}

export default useAbilities; 