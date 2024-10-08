$(document).ready(function () {

  // 팝업 활성화
  function showPopup() {
    $(".pop_bg, .pop_cont").addClass("active");
    $("html, body").addClass("hidden"); // 뒤 배경 스크롤 방지
  }

  // 팝업 비활성화
  function hidePopup() {
    $(".pop_bg, .pop_cont").removeClass("active");
    $("html, body").removeClass("hidden"); // 뒤 배경 스크롤 방지 해제
  }

  $('input[name="uploadFiles"]').on("change", (e) => {
    var file = e.target.files[0];

    // 파일 확장자가 mp4인지 확인
    if (file && file.type === "video/mp4") {
      var videoURL = URL.createObjectURL(file); // 임시 url 생성 

      // 기존에 추가된 비디오 태그가 있으면 제거
      $(".video_box video").remove();

      // 새로운 비디오 태그 생성 및 추가
      var videoTag = $("<video>", {
        src: videoURL,
        controls: true,
      });

      $(".video_box").append(videoTag); // video 태그 추가
      $(".upload_btn").addClass("d_none"); // 업로드 버튼 비활성화
    } else { // 잘못된 형식의 파일 업로드시,
      $(".pop_txt").empty(); // 기존 p 태그 제거

      // 탐색 대상이 선택되지 않았다는 내용의 팝업창 활성화
      $(".pop_txt").append("<p>선택한 파일의 형식이 올바르지 않습니다.</p>");
      $(".pop_txt").append("<p><strong>MP4</strong> 형식의 동영상 파일만 업로드 가능하므로</p>");
      $(".pop_txt").append("<p>올바른 파일 형식으로 업로드하세요.</p>");
      showPopup();
    }
  });

  // 팝업창 내 확인 버튼 클릭시, 팝업 비활성화
  $(".cancel_btn").on("click", (e) => {
    e.preventDefault(); // 기본 링크 동작 방지
    if ($(".pop_detected").hasClass("active")) { // 탐색 대상 선택 팝업창이 활성화된 상태라면
      $(".pop_bg, .pop_cont").removeClass("active"); // 팝업창과 뒷배경만 비활성화(html, body는 스크롤 없는 상태 유지)
    } else {
      hidePopup();
    }
  });

  // Timeline 설정
  let timeline = [];

  // det_result를 전역변수로 선언
  let detResult = [];

  // START 버튼 클릭시, 업로드된 영상을 AI모델에서 1차 분석한 후, 탐색된 객체 리스트 반환  
  $(".start_btn").on("click", () => {
    const fileInput = $("#uploadFilesInput")[0];
    const file = fileInput.files[0];
    console.log(file)

    // 시작 시간
    let startTime = Date.now();

    if (!file) {
      // 파일이 선택되지 않은 경우
      $(".pop_txt").empty(); // 기존 p 태그 제거
      $(".pop_txt").append("<p>동영상 파일이 업로드 되지 않았습니다.</p>");
      $(".pop_txt").append("<p><strong>MP4</strong> 형식의 파일을 업로드해주세요.</p>");
      showPopup();
    } else {
      // 파일이 선택된 경우
      $(".start_box").addClass("d_none"); // 업로드 영역 기존 하단 영역(START버튼 영역) 비활성화

      // FormData 객체 생성 및 파일 추가
      const formData = new FormData();
      formData.append('file', file);  // 필드 이름이 'file'로 설정되어야 합니다

      // 로딩 페이지 표시
      $("#loading-overlay").show();
      $("html, body").addClass("hidden");

      // **JSK**

      $.ajax({
        url: 'http://localhost:8000/uploadfile/',  // 백엔드의 FastAPI 엔드포인트
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          console.log("api connected");
          console.log("response : ", response); // 서버 응답 출력

          // 서버에서 반환된 데이터
          const responseData = response;

          // det_result 데이터를 전역변수에 저장
          detResult = responseData.det_result || [];

          timeline = responseData.timeline || [];

          // const labelList = responseData.label_list || [];

          // AI 분석 결과에서 객체 목록을 표시
          const objectList = responseData.label_list;

          // 배열 길이만큼 li 태그 추가
          let ulTag = $("<ul></ul>");
          objectList.forEach(function (item) {
            let liTag = `<li>${item}</li>`;
            ulTag.append(liTag);
          });
          $(".pop_detected .detected_list_box").append(ulTag);

          // 디버깅을 위한 콘솔 출력
          console.log('Detected Object List:', objectList);

          // 여기에 detected_obj_list를 사용하는 추가적인 코드 작성
          $(".pop_detected, .pop_dt_bg, .bottom_box").addClass("active"); // 탐색 대상 선택 팝업창 활성화
          $("html, body").addClass("hidden");
          $(".detected_list_box.selected, .btn_sec").removeClass("d_none"); // 선택한 리스트 표시 영역 활성화
          $(".right_sec").addClass("next");
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
        complete: function () {
          // 서버 응답 후 로딩 페이지 숨기기
          $("#loading-overlay").hide();
          $("html, body").removeClass("hidden");
        }
      });
    }
    // **수정된 부분 끝**
  });

  // 탐색대상 리스트에서 선택할 시,
  $(".pop_detected").on("click", ".detected_list_box ul li, .select_all", (e) => {
    $(e.target).toggleClass("selected");
    if ($(e.target).hasClass("select_all")) { // 전체 선택 클릭시
      if ($(e.target).hasClass("selected")) {
        $(".detected_list_box ul li").addClass("selected");
      } else {
        $(".detected_list_box ul li").removeClass("selected");
      }
    } else {
      const allItems = $(".detected_list_box ul li");
      const selectedItems = allItems.filter(".selected");

      if (selectedItems.length === allItems.length) {
        // 모든 항목이 선택된 상태라면
        $(".select_all").addClass("selected");
      } else {
        // 전체 선택 활성화된 상태에서 탐색 대상 제외 하는 경우
        $(".select_all").removeClass("selected");
      }
    }

    // 탐색 대상 선택할때마다 하단 선택된 리스트 표시 영역에 추가
    updateSelectedItems();
  });

  function updateSelectedItems() {
    const $selectedList = $(".detected_list_box.selected ul");
    $selectedList.empty(); // 기존 리스트 초기화

    $(".detected_list_box ul li.selected").each(function () {
      const $item = $(this);
      const text = $item.text(); // 항목의 텍스트 가져오기
      $selectedList.append("<li>" + text + "</li>"); // .detected_list_box.selected에 추가
    });
  }

  function sendSelectedItems() {
    // FormData 객체 생성
    const formData = new FormData();

    // 선택된 항목의 텍스트를 배열로 수집
    const labelFilter = [];
    $(".detected_list_box ul li.selected").each(function () {
      labelFilter.push($(this).text().trim());
    });

    // 전역변수 detResult를 FormData에 추가
    console.log("det_result when call api: ", detResult);
    formData.append("det_result", JSON.stringify(detResult));  // 전역변수 detResult 사용

    // 선택된 labelFilter를 FormData에 추가
    console.log("label_filter selected: ", labelFilter);
    formData.append("label_filter", JSON.stringify(labelFilter));  // 추가된 labelFilter 사용

    // file 객체를 FormData에 추가
    const fileInput = $("#uploadFilesInput")[0];
    const file = fileInput.files[0];
    if (file) {
      formData.append("file", file);
      console.log("file: ", file);
    } else {
      console.error("No file selected");
      return;
    }

    // 로딩 오버레이 표시
    $("#loading-overlay").show();

    return new Promise((resolve, reject) => {
      // 서버로 FormData 전송
      $.ajax({
        url: "http://localhost:8000/result-video/",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        xhrFields: {
          responseType: 'blob'  // 서버에서 반환된 데이터를 Blob으로 처리
        },
        success: function (response) {
          // Blob 데이터를 URL로 변환하여 비디오로 사용
          const url = window.URL.createObjectURL(new Blob([response]));

          console.log("url from response: ", url);

          // 기존에 추가된 비디오 태그가 있으면 제거
          $(".video_box video").remove();

          // 새로운 비디오 태그 생성 및 추가
          var videoTag = $("<video>", {
            src: url,   // Blob URL을 src 속성에 설정
            controls: true,
          });

          // video_box 클래스 내에 비디오 태그 추가
          $(".video_box").append(videoTag);

          // 탐색 시간 표시 로직 실행
          resolve();
        },
        error: function (xhr, status, error) {
          console.error("Error processing video:", error);
          reject(error);
        },
        complete: function () {
          // 서버 응답 후 로딩 오버레이 숨기기
          $("#loading-overlay").hide();
        }
      });
    });
  }

  function displayTimeline() {
    // 선택되지 않은 항목을 timeline에서 필터링
    const selectedLabels = $(".detected_list_box ul li.selected").map(function () {
      return $(this).text().trim(); // trim()을 사용하여 공백 제거
    }).get();

    // timeline 데이터가 정의되어 있는지 확인
    console.log('Before Filtering Timeline:', timeline);

    // 선택된 라벨에 해당하는 타임라인만 필터링
    let filteredTimeline = timeline.filter(item => selectedLabels.includes(item.label));

    // 필터링된 timeline을 등장시간 순서대로 정렬
    filteredTimeline.sort((a, b) => {
      const timeA = parseTime(a.start);
      const timeB = parseTime(b.start);
      return timeA - timeB;
    });

    // 필터링된 timeline 데이터 확인
    console.log('Filtered and Sorted Timeline:', filteredTimeline);

    // 정렬된 timeline 데이터를 이용하여 탐색 시간 표시
    let ulTag = $("<ul></ul>");
    filteredTimeline.forEach(function (item, index) {
      let liTag = `
          <li>
              <p>${index + 1}. <span>[${item.label}]</span></p>
              <p>등장시간: ${item.start}</p>
              <p>퇴장시간: ${item.end}</p>
          </li>`;
      ulTag.append(liTag);
    });

    // 기존 ul 태그 제거 후 새로운 ul 태그 추가
    $(".detected_mark_list").empty().append(ulTag);
    $(".detected_mark_box").removeClass("d_none"); // 탐색 시간 표시 영역 활성화
    $(".speaker, .text_mark_box").addClass("d_none");
    $(".right_sec").removeClass("next");
  }

  function parseTime(timeStr) {
    // 시간 형식이 "hh:mm:ss.ms"인 경우, 초 단위로 변환
    const [hms, ms] = timeStr.split('.');
    const [hours, minutes, seconds] = hms.split(':').map(Number);
    return (hours * 3600) + (minutes * 60) + seconds + (ms ? parseInt(ms) / 100 : 0);
  }

  // 선택완료 버튼 클릭시,
  $(".comp_select").on("click", (e) => {
    if ($(".detected_list_box ul li").hasClass("selected") || $(".select_all").hasClass("selected")) { // 탐색대상이 선택된 상태라면
      $(".pop_detected, .pop_dt_bg").removeClass("active"); // 탐색 대상 선택 리스트 팝업창 비활성화
      $("html, body").removeClass("hidden");
    } else { // 탐색대상이 전혀 선택되지 않은 상태라면
      $(".pop_txt").empty(); // 기존 p 태그 제거

      // 탐색 대상이 선택되지 않았다는 내용의 팝업창 활성화
      $(".pop_txt").append("<p>탐색 대상이 선택되지 않았습니다.</p>");
      $(".pop_txt").append("<p>탐색 대상을 선택해주세요.</p>");
      showPopup();
    }
  });

  // 탐색 버튼 클릭시, 
  $(".detect_btn").on("click", (e) => {
    sendSelectedItems().then(() => {
      // 비디오 로딩이 완료된 후 타임라인을 업데이트
      displayTimeline();
      // 내보내기 버튼 활성화
      $(".export_btn").removeClass("d_none");
    });
    // 탐색 버튼을 비활성화
    $(e.target).addClass("d_none");
  });

  // 탐색 대상 및 탐색 시간 텍스트 EXCEL문서로 내보내기
  $(".export_btn").on('click', () => {
    let data = [];
    let num = 0;

    // li 태그 내부의 p 태그에서 데이터를 추출
    $('.detected_mark_list li').each(function () {
      let row = [];

      num++;
      // 각 p 태그를 추출
      let idText = $(this).find('p').eq(0).find('span').text().trim() || '';  // ID 및 사람
      let enterTime = $(this).find('p').eq(1).text().split(': ')[1]?.trim() || '';  // 등장시간
      let exitTime = $(this).find('p').eq(2).text().split(': ')[1]?.trim() || '';  // 퇴장시간      

      row.push(num);
      row.push(idText);
      row.push(enterTime);
      row.push(exitTime);

      data.push(row);
    });

    // SheetJS를 사용해 데이터를 Excel로 내보내기
    const ws = XLSX.utils.aoa_to_sheet([
      ['no', '탐색대상', '등장시간', '퇴장시간'],  // 헤더
      ...data  // 데이터
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "output.xlsx");

    // 비디오 다운로드 처리
    const downloadLink = document.createElement('a');
    downloadLink.href = $("video").attr("src");
    downloadLink.download = 'output.mp4';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  });
});
