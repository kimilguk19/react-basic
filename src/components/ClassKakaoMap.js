/*global kakao*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class KakaoMap extends Component {
    constructor(props) {
        super(props);
        //현재클래스의 state 상태변수값 초기화
        this.state = {
            keyword: '성남시', //검색어 상태 입력예
            pageNo: 1,
            totalCount: 0,
        } //json 1차원 데이터 객체. getData 함수에서 this클래스객체를 사용하기 위해 아래코드 추가
        this.getData = this.getData.bind(this);//this 바인딩
    }

    getData() {

        var url = 'http://localhost:4000/openapi/getdata?keyword=' + this.state.keyword + '&pageNo=' +
            this.state.pageNo;;
        fetch(url, { method: 'get' }) //체인방식으로 실행. 장점은 줄 순서대로 각각 실행 결과가 마무리 된 후 다음 줄이 실행 된다.
            .then(response => response.json()) //응답데이터를 json 형태로 변환
            .then(contents => { //json으로 변환된 응답데이터인 contents 를 가지고 구현하는 내용
                this.state.totalCount = contents['response']['body']['totalCount']['_text'];//js처리
                this.setState({ totalCount: contents['response']['body']['totalCount']['_text'] });//화면처리
                var positions = [];//빈 배열 선언
                var jsonData;
                jsonData = contents['response']['body']['items'];
                console.log(jsonData);
                jsonData['item'].forEach((element) => {//람다식 사용 function(element) {}
                    positions.push(
                        {
                            content: "<div>" + element["csNm"]['_text'] + "</div>",//충전소 이름
                            latlng: new kakao.maps.LatLng(element["lat"]['_text'], element["longi"]['_text']) // 위도(latitude),경도longitude)
                        }
                    );
                });
                // 기존 코드 부분 중략...
                var index = parseInt(positions.length / 2);//배열은 인덱스순서 값을 필수로 가지고, 여기서는 반환 값의 개수로 구한다.
                console.log(jsonData["item"][index]["lat"]['_text']);
                var mapContainer = document.getElementById('map'), // 지도를 표시할 div  
                    mapOption = {
                        center: new kakao.maps.LatLng(jsonData["item"][index]["lat"]['_text'], jsonData["item"][index]["longi"]['_text']),
                        //center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
                        level: 10 // 지도의 확대 레벨
                    };

                var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

                // 마커를 표시할 위치와 내용을 가지고 있는 객체 배열입니다 
                /* var positions = [
                    {
                        content: '<div>카카오</div>',
                        latlng: new kakao.maps.LatLng(33.450705, 126.570677)
                    },
                    {
                        content: '<div>생태연못</div>',
                        latlng: new kakao.maps.LatLng(33.450936, 126.569477)
                    },
                    {
                        content: '<div>텃밭</div>',
                        latlng: new kakao.maps.LatLng(33.450879, 126.569940)
                    },
                    {
                        content: '<div>근린공원</div>',
                        latlng: new kakao.maps.LatLng(33.451393, 126.570738)
                    }
                ]; */

                for (var i = 0; i < positions.length; i++) {
                    // 마커를 생성합니다
                    var marker = new kakao.maps.Marker({
                        map: map, // 마커를 표시할 지도
                        position: positions[i].latlng // 마커의 위치
                    });

                    // 마커에 표시할 인포윈도우를 생성합니다 
                    var infowindow = new kakao.maps.InfoWindow({
                        content: positions[i].content // 인포윈도우에 표시할 내용
                    });

                    // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
                    // 이벤트 리스너로는 클로저를 만들어 등록합니다 
                    // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
                    kakao.maps.event.addListener(marker, 'mouseover', makeOverListener(map, marker, infowindow));
                    kakao.maps.event.addListener(marker, 'mouseout', makeOutListener(infowindow));
                }

                // 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
                function makeOverListener(map, marker, infowindow) {
                    return function () {
                        infowindow.open(map, marker);
                    };
                }

                // 인포윈도우를 닫는 클로저를 만드는 함수입니다 
                function makeOutListener(infowindow) {
                    return function () {
                        infowindow.close();
                    };
                }

            })
            .catch((err) => console.log('에러: ' + err + '때문에 접속할 수 없습니다.'));//.then함수 끝 추가. 위 기존 코드 중략부분 중 positions 변수 부분 지운다.


    } //getData()함수 끝
    componentDidMount() {
        this.getData();
    }

    render() {

        return (
            <div>
                <h2><a href='/'>클래스형 전기차 충전소 위치</a></h2>
                <div id="map" style={{ width: "100%", height: "100vh" }}></div>
            </div>
        );
    }
}

KakaoMap.propTypes = {

};

export default KakaoMap;