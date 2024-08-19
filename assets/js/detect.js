$(document).ready(function() {

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
    hidePopup();
  });

  // START 버튼 클릭시, 업로드된 영상을 AI모델에서 1차 분석한 후, 탐색된 객체 리스트 반환
  $(".start_btn").on("click", () => {
    if ($(".video_box video").length === 0) { // 영상 업로드 전일 경우,
      $(".pop_txt").empty(); // 기존 p 태그 제거
        
      // 핍업창 내 텍스트 변경
      $(".pop_txt").append("<p>동영상 파일이 업로드 되지 않았습니다.</p>");
      $(".pop_txt").append("<p><strong>MP4</strong> 형식의 파일을 업로드해주세요.</p>");
      showPopup();
    } else { // 영상 업로드된 상태일 경우,
        $(".start_box").addClass("d_none"); // 업로드 영역 기존 하단 영역(START버튼 영역) 비활성화
        $(".pop_detected, .pop_dt_bg, .bottom_box").addClass("active"); // 탐색 대상 선택 팝업창 활성화
        $("html, body").addClass("hidden");
        $(".detected_list_box.selected, .btn_sec").removeClass("d_none"); // 선택한 리스트 표시 영역 활성화
        $(".right_sec").addClass("next");
    }
// AI 모델에서 반환된 탐색된 객체 리스트
    // const detected_obj_list = ["Object 1", "Object 2", "Object 3", "Object 4", "Object 5", "Object 1", "Object 2", "Object 3", "Object 4", "Object 5", "Object 1", "Object 2", "Object 3", "Object 4", "Object 5", "Object 1", "Object 2", "Object 3", "Object 4", "Object 5"];

    // ul 태그 내 기존 li 태그 초기화 (필요에 따라)
    // $(".pop_detected .detected_list_box ul").empty();

    // 배열 길이만큼 li 태그 추가
    // detected_obj_list.forEach(function(item) {
        // $(".pop_detected .detected_list_box ul").append("<li>" + item + "</li>");
    // });    
   // **수정된 부분 시작**
        // AJAX를 사용해 파일 업로드 및 AI 모델 분석 결과 요청
        var fileInput = $('input[name="uploadFiles"]')[0].files[0];
        
        // 파일이 업로드된 경우에만 진행
        if (fileInput) {
            var formData = new FormData();
            formData.append('file', fileInput);

            $.ajax({
                url: '/uploadfile/',  // 백엔드의 FastAPI 엔드포인트
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log(response);

                    // AI 분석 결과에서 객체 목록을 표시
                    var objectList = response.label_list;
                    var detectionDetails = response.det_result.timeline;

                    // 탐지된 객체 리스트 표시
                    var $listBox = $(".detected_list_box ul");
                    $listBox.empty();  // 기존 리스트 초기화
                    objectList.forEach(function(item) {
                        $listBox.append("<li>" + item + "</li>");
                    });

                    // 객체의 시간 정보 표시
                    var $timeBox = $(".detected_mark_list ul");
                    $timeBox.empty();  // 기존 시간 정보 초기화
                    for (const [objId, times] of Object.entries(detectionDetails)) {
                        $timeBox.append("<li><p>객체 ID: " + objId + "</p><p>등장시간: " + times.start + "초</p><p>퇴장시간: " + times.end + "초</p></li>");
                    }

                    // 분석된 결과가 화면에 표시되도록 UI 업데이트
                    $(".detected_mark_box").removeClass("d_none");
                },
                error: function(error) {
                    console.error('오류 발생:', error);
                }
            });
        }
        // **수정된 부분 끝**

  });


  // 탐색대상 리스트에서 선택할 시,
  $(".pop_detected").on("click", ".detected_list_box ul li, .select_all", (e) => {
    $(e.target).toggleClass("selected");
    if($(e.target).hasClass("select_all")){ // 전체 선택 클릭시
      if($(e.target).hasClass("selected")){
        $(".detected_list_box ul li").addClass("selected");
      }else{
        $(".detected_list_box ul li").removeClass("selected");
      }
    }else{
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
  })

  function updateSelectedItems() {
    const $selectedList = $(".detected_list_box.selected ul");
    $selectedList.empty(); // 기존 리스트 초기화

    $(".detected_list_box ul li.selected").each(function() {
        const $item = $(this);
        const text = $item.text(); // 항목의 텍스트 가져오기
        $selectedList.append("<li>" + text + "</li>"); // .detected_list_box.selected에 추가
    });
  }

  // 선택완료 버튼 클릭시,
  $(".comp_select").on("click", (e) => {
    if($(".detected_list_box ul li").hasClass("selected") || $(".select_all").hasClass("selected")){ // 탐색대상이 선택된 상태라면
      $(".pop_detected, .pop_dt_bg").removeClass("active"); // 탐색 대상 선택 리스트 팝업창 비활성화
      $("html, body").removeClass("hidden");
    }else{ // 탐색대상이 전혀 선택되지 않은 상태라면
      $(".pop_txt").empty(); // 기존 p 태그 제거
        
      // 탐색 대상이 선택되지 않았다는 내용의 팝업창 활성화
      $(".pop_txt").append("<p>탐색 대상이 선택되지 않았습니다.</p>");
      $(".pop_txt").append("<p>탐색 대상을 선택해주세요.</p>");
      showPopup();
    }
  });

  // 탐색 버튼 클릭시, 
  $(".detect_btn").on("click",(e)=>{
    $(".detected_mark_box").removeClass("d_none"); // 탐색 시간 표시 영역 활성화
    $(".speaker, .text_mark_box").addClass("d_none");
    $(".right_sec").removeClass("next");
    $(".detect_btn").addClass("export_btn").text("내보내기");
  })

});