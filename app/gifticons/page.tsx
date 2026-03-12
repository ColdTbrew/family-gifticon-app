import Link from "next/link";
import { DeleteGifticonButton } from "@/components/delete-gifticon-button";
import { fetchCurrentUserGifticons } from "@/lib/data/gifticons";
import { createGifticon, updateGifticon } from "./actions";

export const dynamic = "force-dynamic";

export default async function GifticonsPage() {
  const { gifticons, isAuthenticated, errorMessage } = await fetchCurrentUserGifticons();

  return (
    <section>
      <header className="page-header">
        <p className="eyebrow">등록/수정/삭제</p>
        <h1>기프티콘 관리</h1>
        <p className="muted">한 화면에서 기프티콘 CRUD를 처리합니다.</p>
      </header>

      {!isAuthenticated ? (
        <div className="notice-card">
          <p className="notice-title">로그인이 필요합니다.</p>
          <p className="muted">기프티콘 관리 화면은 로그인 후 이용할 수 있습니다.</p>
          <Link className="action-link" href="/auth">
            로그인하러 가기
          </Link>
        </div>
      ) : errorMessage ? (
        <div className="notice-card">
          <p className="notice-title">기프티콘 데이터를 불러오지 못했습니다.</p>
          <p className="muted">{errorMessage}</p>
        </div>
      ) : (
        <div className="crud-layout">
          <article className="crud-panel">
            <h2>새 기프티콘 등록</h2>
            <form action={createGifticon} className="gifticon-form">
              <label>
                이름
                <input name="title" required />
              </label>
              <label>
                브랜드
                <input name="brand" required />
              </label>
              <label>
                바코드
                <input name="barcode" required />
              </label>
              <label>
                만료일
                <input name="expiresAt" type="date" required />
              </label>
              <label>
                상태
                <select name="status" defaultValue="available">
                  <option value="available">사용 가능</option>
                  <option value="used">사용 완료</option>
                  <option value="expired">만료</option>
                </select>
              </label>
              <button type="submit">등록</button>
            </form>
          </article>

          <article className="crud-panel">
            <h2>등록된 기프티콘 ({gifticons.length})</h2>
            {gifticons.length === 0 ? (
              <p className="empty">등록된 기프티콘이 없습니다.</p>
            ) : (
              <div className="gifticon-edit-list">
                {gifticons.map((gifticon) => (
                  <form key={gifticon.id} action={updateGifticon} className="gifticon-form inline">
                    <input type="hidden" name="id" value={gifticon.id} />
                    <label>
                      이름
                      <input name="title" defaultValue={gifticon.title} required />
                    </label>
                    <label>
                      브랜드
                      <input name="brand" defaultValue={gifticon.brand} required />
                    </label>
                    <label>
                      바코드
                      <input name="barcode" defaultValue={gifticon.barcode} required />
                    </label>
                    <label>
                      만료일
                      <input name="expiresAt" type="date" defaultValue={gifticon.expiresAt} required />
                    </label>
                    <label>
                      상태
                      <select name="status" defaultValue={gifticon.status}>
                        <option value="available">사용 가능</option>
                        <option value="used">사용 완료</option>
                        <option value="expired">만료</option>
                      </select>
                    </label>
                    <div className="row-actions">
                      <button type="submit">수정</button>
                      <DeleteGifticonButton id={gifticon.id} />
                    </div>
                  </form>
                ))}
              </div>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
